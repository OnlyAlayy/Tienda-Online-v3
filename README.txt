===============================
TIENDA ONLINE - TravelFly
===============================

📁 ESTRUCTURA DEL PROYECTO:
Ruta principal del proyecto:
C:\Users\Anto\Desktop\Maty\Olimpiadas\Tienda-Online

- 📂 backend/ → Carpeta del backend (código Node.js, Express, sesiones, etc.)
- 📄 viajesbd.sql → Script de base de datos para importar
- 📄 README.txt → Este archivo de instrucciones

🌐 DESCRIPCIÓN:
Este es el backend del proyecto "Tienda Online" para la empresa ficticia TravelFly. Permite la compra de pasajes con reserva de asiento, selección de clase y fechas, pago mediante PayPal, y gestión de sesiones de usuario.

-------------------------------
📦 REQUISITOS PREVIOS:
-------------------------------
1. Node.js y npm instalados.
2. MySQL o MariaDB en funcionamiento.
3. Importar la base de datos desde el archivo `travelfly.sql` incluido en la carpeta principal del proyecto:

C:\Users\Anto\Desktop\Maty\Olimpiadas\Tienda-Online


-------------------------------
⚙️ INSTALACIÓN DEL BACKEND:
-------------------------------
1. Abrir terminal y posicionarse en:

cd C:\Users\Anto\Desktop\Maty\Olimpiadas\Tienda-Online\backend


2. Instalar dependencias:

npm install


3. Crear un archivo `.env` dentro de la carpeta `backend` con el siguiente contenido:

SESSION_SECRET=carrito-secret-2025

MAIL_USER=tu_correo_de_envio@gmail.com
MAIL_PASS=tu_contraseña_o_clave_de_aplicación

PAYPAL_CLIENT_ID=tu_client_id_de_paypal
PAYPAL_CLIENT_SECRET=tu_client_secret_de_paypal

🔑 ¿DÓNDE CONSIGO MIS CLAVES?
🟦 PayPal (modo sandbox):
Ingresá al Dashboard de PayPal Developer.

Iniciá sesión con tu cuenta de PayPal.

En el menú, andá a "My Apps & Credentials".

En la sección Sandbox, creá una nueva app (por ejemplo, "TravelFly").

Copiá tu Client ID y Client Secret de la app recién creada.

Pegalos en el archivo .env.

📧 Gmail (clave de aplicación):
Ingresá a tu cuenta de Gmail.

Activá la verificación en dos pasos (2FA) si no la tenés activada:
https://myaccount.google.com/security

Luego, entrá a Claves de aplicación.

Elegí "Correo" y "Windows Computer" (o similar), luego generá la clave.

Usá esa clave como MAIL_PASS y tu correo de Gmail como MAIL_USER.


🔐 **IMPORTANTE**:  
- Nunca subas este archivo `.env` a GitHub. Está excluido mediante `.gitignore`.
- Debés obtener tus propias credenciales de PayPal desde el [Dashboard de Developer de PayPal](https://developer.paypal.com/) (modo sandbox o producción).
- Para `MAIL_USER` y `MAIL_PASS`, se recomienda usar una cuenta de Gmail con clave de aplicación (si tenés 2FA activado).

-------------------------------
🚀 INICIAR EL SERVIDOR:
-------------------------------

node app.js

La aplicación se ejecutará en:

http://localhost:3000


-------------------------------
🔧 FUNCIONALIDADES INCLUIDAS:
-------------------------------
- Registro e inicio de sesión con Express y sesiones.
- Carrito de compras por sesión.
- Reservas con selección de asiento, clase y fechas.
- Integración de pagos con PayPal (sandbox).
- Envío de mails (requiere completar `mailer.js`).
- Renderizado de vistas con EJS.
- Panel de productos dinámico con fechas de ida y vuelta.






Contraseña de administrador y usuario:

Usuario : admin
Contraseña: admin1234