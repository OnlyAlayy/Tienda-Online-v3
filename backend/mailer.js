const express = require('express');
const nodemailer = require('nodemailer');
const conexion = require('./conexion');
require('dotenv').config();
const router = express.Router();

// Ruta de envío de formulario de contacto
router.post('/enviar-consulta', async (req, res) => {
  const { nombre, email, mensaje } = req.body;

  // Validación básica
  if (!nombre || !email || !mensaje) {
    return res.redirect('/contact?error=Faltan+datos+obligatorios');
  }

  // Configurar el transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    replyTo: email,
    to: process.env.MAIL_USER,
    subject: `Consulta de ${nombre}`,
    html: `
      <h2>Consulta desde TravelFly</h2>
      <p><strong>Nombre:</strong> ${nombre}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mensaje:</strong><br>${mensaje}</p>
    `
  };

  try {
    // Enviar email
    await transporter.sendMail(mailOptions);

    // Guardar en base de datos
    await conexion.query(
      'INSERT INTO contactos (nombre, email, mensaje) VALUES (?, ?, ?)',
      [nombre, email, mensaje]
    );

    return res.redirect('/contact?sent=1');
  } catch (error) {
    console.error('Error al enviar o guardar mensaje:', error);
    return res.redirect('/contact?error=Ocurrió+un+error.+Intentá+más+tarde');
  }
});

module.exports = router;
