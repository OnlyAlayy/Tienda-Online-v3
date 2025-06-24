const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const prevButton = document.querySelector('.carousel-btn.prev');
const nextButton = document.querySelector('.carousel-btn.next');
const dotsNav = document.querySelector('.carousel-dots');
const dots = Array.from(dotsNav.children);


console.log('✅ script.js cargado');


let currentIndex = 0;

const updateSlidePosition = () => {
  track.style.transform = `translateX(-${currentIndex * 100}%)`;
  dots.forEach(dot => dot.classList.remove('active'));
  dots[currentIndex].classList.add('active');
};

dots.forEach(dot => {
  dot.addEventListener('click', (e) => {
    currentIndex = parseInt(e.target.dataset.index);
    updateSlidePosition();
  });
});

// Auto-slide
setInterval(() => {
  currentIndex = (currentIndex + 1) % slides.length;
  updateSlidePosition();
}, 5000);

// Mostrar productos ocultos al hacer clic
document.getElementById('ver-mas-btn').addEventListener('click', () => {
  document.querySelectorAll('.producto.oculto').forEach(el => {
    el.classList.remove('oculto');
  });
  document.getElementById('ver-mas-btn').style.display = 'none';
});

// Mostrar u ocultar el botón al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  const ocultos = document.querySelectorAll('.producto.oculto');
  const verMasBtn = document.getElementById('ver-mas-btn');

  if (ocultos.length === 0 && verMasBtn) {
    verMasBtn.style.display = 'none';
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("carrito-toggle");
  const detalle = document.getElementById("carrito-detalle");
  const lista = document.getElementById("lista-carrito");
  const contador = document.getElementById("contador-carrito");
  const vaciar = document.getElementById("vaciar-carrito");
  const pagar = document.getElementById("pagar-carrito");

  toggle.addEventListener("click", () => {
      detalle.classList.toggle("mostrar");

    if (!detalle.classList.contains("oculto")) {
      fetch('/carrito')
        .then(res => res.json())
        .then(mostrarCarrito)
        .catch(console.error);
    }
  });

function mostrarCarrito(carrito) {
  console.log('Carrito recibido:', carrito);
  lista.innerHTML = "";
  let total = 0;

  if (carrito.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Tu carrito está vacío.";
    lista.appendChild(li);
  } else {
    carrito.forEach(prod => {
      total += prod.precio * prod.cantidad;
      const li = document.createElement("li");
         li.innerHTML = `
            <strong>${prod.nombre}</strong> x${prod.cantidad} <br>
            Clase: ${prod.clase || '—'} <br>
            Asiento: ${prod.asiento || '—'} <br>
            Fecha ida: ${prod.fecha_ida || 'No seleccionada'} <br>
            Fecha vuelta: ${prod.fecha_vuelta || 'No seleccionada'} <br>
            <button onclick="eliminarDelCarrito('${prod.id}')">❌</button>
          `;
      lista.appendChild(li);
    });

    const totalLi = document.createElement("li");
    totalLi.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
    lista.appendChild(totalLi);
  }

  contador.textContent = carrito.length;
}


  window.eliminarDelCarrito = (id) => {
    fetch('/carrito/eliminar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    .then(res => res.json())
    .then(data => mostrarCarrito(data.carrito));
  }

  vaciar.addEventListener("click", () => {
    fetch('/carrito/vaciar', { method: 'POST' })
      .then(res => res.json())
      .then(() => {
        lista.innerHTML = "";
        contador.textContent = "0";
      });
  });

  pagar.addEventListener("click", () => {
    window.location.href = "/pago"; // o iniciar flujo PayPal desde frontend
  });
});

function agregarAlCarrito(id, nombre, precio, imagen, fecha_ida, fecha_vuelta, clase, asiento) {
  if (!fecha_ida || !fecha_vuelta) {
    alert("Selecciona ambas fechas: ida y vuelta.");
    return;
  }

  if (!clase || !asiento) {
    alert("Selecciona clase y asiento.");
    return;
  }

  // Validar límite de asientos
  const asientoInput = document.getElementById(`asiento-${id}`);
  const maxAsientos = parseInt(asientoInput.max || "40");
  const numAsiento = parseInt(asientoInput.value);

  if (numAsiento > maxAsientos) {
    Swal.fire({
      icon: 'warning',
      title: 'Límite de asientos',
      text: `Solo hay ${maxAsientos} asientos disponibles.`
    });
    return;
  }

  precio = parseFloat(precio);
  if (isNaN(precio)) {
    console.error("Precio inválido:", precio);
    return;
  }

  fetch('/carrito/agregar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, nombre, precio, imagen, fecha_ida, fecha_vuelta, clase, asiento })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("contador-carrito").textContent = data.carrito.length;
    Swal.fire({
      title: '¡Agregado!',
      text: 'El producto fue agregado al carrito.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  })
  .catch(error => {
    console.error('Error al agregar al carrito:', error);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.select-fecha').forEach(select => {
    select.addEventListener('change', function () {
      const id = this.id.split('-')[1];
      const fechaIda = document.getElementById(`fecha-${id}`).value;
      const fechaVuelta = document.getElementById(`vuelta-${id}`).value;
      const span = document.getElementById(`fechas-seleccionadas-${id}`);
      if (span) {
        span.textContent = `${fechaIda || '—'} / ${fechaVuelta || '—'}`;
      }
    });
  });
});



const buscador = document.getElementById('buscador');
const productos = Array.from(document.querySelectorAll('.producto'));
const verMasBtn = document.getElementById('ver-mas-btn');

buscador.addEventListener('input', () => {
  const filtro = buscador.value.toLowerCase();

  if (filtro) {
    productos.forEach(prod => {
      const nombre = prod.querySelector('h2').textContent.toLowerCase();
      prod.style.display = nombre.includes(filtro) ? 'block' : 'none';
    });
    verMasBtn.style.display = 'none'; // Oculta el botón cuando se busca
  } else {
    // Restaurar a mostrar solo los primeros 6
    productos.forEach((prod, i) => {
      prod.style.display = i < 6 ? 'block' : 'none';
    });
    verMasBtn.style.display = productos.length > 6 ? 'inline-block' : 'none';
  }
});

// Al hacer clic en "Ver más"
verMasBtn.addEventListener('click', () => {
  productos.forEach(prod => prod.style.display = 'block');
  verMasBtn.style.display = 'none';
});

function aplicarFiltros() {
  const categoriaSelect = document.getElementById('filtro-categoria');
  const categoria = categoriaSelect ? categoriaSelect.value : '';
  const precio = document.getElementById('filtro-precio').value;
  const fecha = document.getElementById('filtro-fecha').value;
  const busqueda = document.getElementById('buscador').value.toLowerCase();

  const productos = Array.from(document.querySelectorAll('.producto'));

  let visibles = productos.filter(prod => {
    const nombre = prod.querySelector('h2').textContent.toLowerCase();
    const tipo = prod.dataset.tipo;
    const opcionesFecha = prod.querySelectorAll('.select-fecha option');

    let mostrar = true;

    if (busqueda && !nombre.includes(busqueda)) mostrar = false;
    if (categoria && tipo !== categoria) mostrar = false;

    if (fecha) {
      const fechaSeleccionada = new Date(fecha);
      const coincide = Array.from(opcionesFecha).some(opt => {
        const fechaOpcion = new Date(opt.value);
        const diferenciaEnDias = Math.abs((fechaOpcion - fechaSeleccionada) / (1000 * 60 * 60 * 24));
        return diferenciaEnDias <= 3; // permite ±3 días
      });
      if (!coincide) mostrar = false;
    }

    prod.style.display = mostrar ? 'block' : 'none';
    return mostrar;
  });

  // Ordenar por precio si corresponde
  if (precio === 'asc' || precio === 'desc') {
    const store = document.querySelector('.store');
    visibles.sort((a, b) => {
      const pa = parseFloat(a.dataset.precio);
      const pb = parseFloat(b.dataset.precio);
      return precio === 'asc' ? pa - pb : pb - pa;
    });
    visibles.forEach(p => store.appendChild(p));
  }

  // Ocultar botón "ver más"
  // Mostrar u ocultar "Ver más" dependiendo si hay productos ocultos
  const productosOcultos = document.querySelectorAll('.producto:not([style*="display: none"])');
  if (productosOcultos.length > 6) {
    productosOcultos.forEach((prod, i) => {
      prod.style.display = i < 6 ? 'block' : 'none';
    });
    verMasBtn.style.display = 'inline-block';
  } else {
    verMasBtn.style.display = 'none';
  }

}



const btnFiltros = document.getElementById('toggle-filtros');
const filtros = document.getElementById('filtros-contenedor');

btnFiltros.addEventListener('click', () => {
  const estaAbierto = filtros.classList.contains('mostrar');

  if (estaAbierto) {
    filtros.classList.remove('mostrar');
    filtros.classList.add('cerrando');

    setTimeout(() => {
      filtros.classList.remove('cerrando');
    }, 600); // igual a la duración de la animación en el CSS
    btnFiltros.innerHTML = '<i class="fas fa-sliders-h"></i> Filtros';
  } else {
    filtros.classList.remove('cerrando');
    filtros.classList.add('mostrar');
    btnFiltros.innerHTML = '<i class="fas fa-times"></i> Ocultar filtros';
  }
});

// Cerrar filtros al hacer clic fuera
document.addEventListener('click', function (event) {
  const esClickDentro = filtros.contains(event.target) || btnFiltros.contains(event.target);
  const estaAbierto = filtros.classList.contains('mostrar');

  if (!esClickDentro && estaAbierto) {
    filtros.classList.remove('mostrar');
    filtros.classList.add('cerrando');
    setTimeout(() => {
      filtros.classList.remove('cerrando');
    }, 600);
    btnFiltros.innerHTML = '<i class="fas fa-sliders-h"></i> Filtros';
  }
});

