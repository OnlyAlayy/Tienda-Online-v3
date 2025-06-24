const mysql = require('mysql2');

const conexion = mysql.createPool({
    host: "localhost",
    database: "viajesbd",
    user: "root",
    password: "",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = conexion.promise(); // <-- exportá el pool con promesas
