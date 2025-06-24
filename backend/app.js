const express = require('express');
const path = require('path');
const conexion = require('./conexion'); // Conexión a la base de datos
const paypal = require('@paypal/checkout-server-sdk');
const session = require('express-session');
const bcrypt = require('bcrypt');
require('dotenv').config(); // Carga variables desde .env


const app = express();
const port = 3000;



// Configuración para que Express maneje datos POST de formularios (urlencoded y JSON)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. Primero configura la sesión
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// 2. Luego monta el router mailer (y otros routers que usen sesión)
const mailerRouter = require('./mailer');
app.use('/', mailerRouter);



// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views')); // Configuración de la carpeta views

// Servir archivos estáticos desde la carpeta 'public' (para CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, '..', 'public')));


// Configuración del entorno PayPal
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);

const client = new paypal.core.PayPalHttpClient(environment);

// Ruta para la página principal
app.get('/', async (req, res) => {
  const query = `
    SELECT 
      p.*, 
      GROUP_CONCAT(DISTINCT DATE_FORMAT(f1.fecha, '%Y-%m-%d')) AS fechas_ida,
      GROUP_CONCAT(DISTINCT DATE_FORMAT(f2.fecha, '%Y-%m-%d')) AS fechas_vuelta
    FROM productos p
    LEFT JOIN fechas_disponibles f1 ON p.id_producto = f1.id_producto
    LEFT JOIN fechas_vuelta f2 ON p.id_producto = f2.id_producto
    GROUP BY p.id_producto
  `;

  try {
    const [resultados] = await conexion.query(query);
    const productos = resultados.map(row => ({
      ...row,
      fechas: row.fechas_ida ? row.fechas_ida.split(',') : [],
      fechas_vuelta: row.fechas_vuelta ? row.fechas_vuelta.split(',') : []
    }));
    
    res.render('index', { 
      productos,
      user: req.session.user || null  // <-- esto pasa la sesión al template
    });

  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).send('Error al obtener productos');
  }
});


app.get('/login', (req, res) => {
  res.render('login'); // Va a renderizar login.ejs que debe estar en /views
});

app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json({ isLoggedIn: true, user: req.session.user });
  } else {
    res.json({ isLoggedIn: false });
  }
});


// Ruta para registrar usuario (recibe POST con loginUser y loginPass)
app.post('/register', async (req, res) => {
  const { loginUser, loginPass, foto_perfil } = req.body;

  if (!loginUser || !loginPass) {
    return res.status(400).json({ error: 'Completa todos los campos' });
  }

  try {
    const [rows] = await conexion.query('SELECT * FROM usuarios WHERE username = ?', [loginUser]);
    if (rows.length > 0) {
      return res.status(400).json({ error: 'Usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(loginPass, 10);
    const imagenPerfil = foto_perfil || 'default1.png';

await conexion.query(
  'INSERT INTO usuarios (username, password, foto_perfil) VALUES (?, ?, ?)',
  [loginUser, hashedPassword, imagenPerfil]
);

// Luego de insertar, buscá el usuario:
const [insertedRows] = await conexion.query('SELECT * FROM usuarios WHERE username = ?', [loginUser]);
const usuario = insertedRows[0];

req.session.user = {
  id: usuario.id,
  username: usuario.username,
  foto_perfil: usuario.foto_perfil,
  rol: usuario.rol 
};


    res.redirect('/');
  } catch (error) {
    console.error('Error en /register:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}); 


// Ruta para iniciar sesión (POST con email y password)
app.post('/login', async (req, res) => {
  const { email, password, remember } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Completa todos los campos' });
  }

  try {
    const [rows] = await conexion.query('SELECT * FROM usuarios WHERE username = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const usuario = rows[0];
    const match = await bcrypt.compare(password, usuario.password);
    if (!match) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    req.session.user = {
      id: usuario.id,
      username: usuario.username,
      foto_perfil: usuario.foto_perfil,
      rol: usuario.rol
    };


    // Si NO marcó "Recuérdame", eliminamos la duración (sesión corta)
    if (!remember) {
      req.session.cookie.expires = false;
    }

      if (usuario.rol === 'admin') {
        return res.redirect('/admin/dashboard');
      } else {
        return res.redirect('/');
      }

  } catch (error) {
    console.error('Error en /login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});


function soloAdmin(req, res, next) {
  if (req.session.user && req.session.user.rol === 'admin') {
    return next();
  }
  return res.status(403).send('Acceso denegado');
}

// Vista del panel admin
app.get('/admin/dashboard', soloAdmin, async (req, res) => {
  try {
    const [productos] = await conexion.query('SELECT * FROM productos');
    res.render('admin-dashboard', { user: req.session.user, productos });
  } catch (error) {
    console.error('Error al cargar dashboard admin:', error);
    res.status(500).send('Error en el servidor');
  }
});

// Eliminar viaje
app.post('/admin/eliminar-viaje/:id', soloAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Primero borra las dependencias (relaciones hijas)
    await conexion.query('DELETE FROM reservas WHERE id_producto = ?', [id]);
    await conexion.query('DELETE FROM fechas_disponibles WHERE id_producto = ?', [id]);
    await conexion.query('DELETE FROM fechas_vuelta WHERE id_producto = ?', [id]);

    // Luego sí podés borrar el producto
    await conexion.query('DELETE FROM productos WHERE id_producto = ?', [id]);

    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error al eliminar viaje:', error);
    res.status(500).send(`Error al eliminar el viaje: ${error.message}`);
  }
});


// Reagendar/Editar viaje
app.post('/admin/editar-viaje/:id', soloAdmin, async (req, res) => {
  const { id } = req.params;
  const { producto, precio, clase, imagen, descripcion } = req.body;

  try {
    await conexion.query(
      'UPDATE productos SET producto = ?, precio = ?, clase = ?, imagen = ?, descripcion = ? WHERE id_producto = ?',
      [producto, precio, clase, imagen, descripcion, id]
    );
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error al editar viaje:', error);
    res.status(500).send('Error al editar el viaje');
  }
});

// Crear nuevo viaje
app.post('/admin/crear-viaje', soloAdmin, async (req, res) => {
  const { producto, precio, clase, imagen, descripcion } = req.body;

  if (!producto || !precio || !clase || !imagen || !descripcion) {
    return res.status(400).send('Faltan datos del viaje');
  }

  try {
    await conexion.query(
      'INSERT INTO productos (producto, precio, clase, imagen, descripcion) VALUES (?, ?, ?, ?, ?)',
      [producto, precio, clase, imagen, descripcion]
    );
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error al crear viaje:', error);
    res.status(500).send('Error al crear el viaje');
  }
});


// Agregar fecha de ida a un viaje
app.post('/admin/agregar-fecha/:id', soloAdmin, async (req, res) => {
  const { id } = req.params;
  const { fecha } = req.body;

  if (!fecha) return res.status(400).send('Fecha requerida');

  try {
    await conexion.query(
      'INSERT INTO fechas_disponibles (id_producto, fecha) VALUES (?, ?)',
      [id, fecha]
    );
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error al agregar fecha de ida:', error);
    res.status(500).send('Error al agregar la fecha de ida');
  }
});

// Agregar fecha de vuelta a un viaje
app.post('/admin/agregar-fecha-vuelta/:id', soloAdmin, async (req, res) => {
  const { id } = req.params;
  const { fecha } = req.body;

  if (!fecha) return res.status(400).send('Fecha requerida');

  try {
    await conexion.query(
      'INSERT INTO fechas_vuelta (id_producto, fecha) VALUES (?, ?)',
      [id, fecha]
    );
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error al agregar fecha de vuelta:', error);
    res.status(500).send('Error al agregar la fecha de vuelta');
  }
});


// Ruta para cerrar sesión
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Ruta para crear una orden de PayPal
app.post('/create-order', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'No autenticado. Por favor inicia sesión.' });
  }

  const { precio, descripcion } = req.body;

  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: precio,
        },
        description: descripcion,
      },
    ],
  });

  try {
    const order = await client.execute(request);
    res.json({ id: order.result.id });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al crear la orden');
  }
});



// Obtener el carrito
app.get('/carrito', (req, res) => {
  const carrito = req.session.carrito || [];
  res.json(carrito);
});

// Agregar producto al carrito con ida y vuelta
app.post('/carrito/agregar', (req, res) => {
  const { id, nombre, precio, imagen, fecha_ida, fecha_vuelta, clase, asiento } = req.body;

  if (!req.session.carrito) {
    req.session.carrito = [];
  }

  const yaExiste = req.session.carrito.find(p =>
    p.id === id &&
    p.fecha_ida === fecha_ida &&
    p.fecha_vuelta === fecha_vuelta &&
    p.clase === clase &&
    p.asiento === asiento
  );

  if (yaExiste) {
    yaExiste.cantidad += 1;
  } else {
    req.session.carrito.push({
      id, nombre, precio, imagen, fecha_ida, fecha_vuelta, clase, asiento, cantidad: 1
    });
  }

  res.json({ mensaje: 'Producto agregado al carrito', carrito: req.session.carrito });
});

// Vaciar el carrito
app.post('/carrito/vaciar', (req, res) => {
  req.session.carrito = [];
  res.json({ mensaje: 'Carrito vaciado' });
});

// Eliminar un producto del carrito
app.post('/carrito/eliminar', (req, res) => {
  const { id } = req.body;
  if (!req.session.carrito) req.session.carrito = [];

  req.session.carrito = req.session.carrito.filter(p => p.id !== id);
  res.json({ mensaje: 'Producto eliminado', carrito: req.session.carrito });
});

app.get('/pago', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const carritoCrudo = req.session.carrito || [];

  const carrito = carritoCrudo
    .filter(p => p.precio != null && p.cantidad != null)
    .map(p => ({
      ...p,
      precio: Number(p.precio),
      cantidad: Number(p.cantidad)
    }))
    .filter(p => !isNaN(p.precio) && !isNaN(p.cantidad));

  const total = carrito.reduce((t, p) => t + p.precio * p.cantidad, 0);

res.render('pago', { carrito, total: total.toFixed(2) });
});


app.post('/confirmar-reservas', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Debés iniciar sesión' });
  }

  const carrito = req.session.carrito || [];

  try {
    for (const item of carrito) {
      const { id, clase, asiento, fecha_ida, fecha_vuelta } = item;

      // Verificar si ya está reservado
      const [reservado] = await conexion.query(`
        SELECT * FROM reservas 
        WHERE id_producto = ? AND clase = ? AND asiento = ? AND fecha_ida = ?
      `, [id, clase, asiento, fecha_ida]);

      if (reservado.length > 0) {
        return res.status(400).json({ error: `El asiento ${asiento} ya está reservado.` });
      }

      // Insertar reserva
      await conexion.query(`
        INSERT INTO reservas (id_producto, id_usuario, clase, asiento, fecha_ida, fecha_vuelta)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [id, req.session.user.id, clase, asiento, fecha_ida, fecha_vuelta]);
    }

    req.session.carrito = []; // Vaciar carrito después de reservar
    res.json({ success: true, mensaje: 'Reservas confirmadas con éxito' });

  } catch (error) {
    console.error('Error al guardar reservas:', error);
    res.status(500).json({ error: 'Error en el servidor al guardar reservas' });
  }
});



app.get('/about', (req, res) => {
  res.render('about', { user: req.session.user, titulo: 'Sobre Nosotros' });
});

app.get('/services', (req, res) => {
  res.render('services', { user: req.session.user, titulo: 'Servicios' });
});

app.get('/contact', (req, res) => {
  res.render('contact', {
    user: req.session.user,
    titulo: 'Contacto'
  });
});


// Configuración del servidor para escuchar en el puerto 3000
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
