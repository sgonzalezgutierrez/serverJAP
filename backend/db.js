const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'ecommerce_user',
  password: '2025',
  database: 'ecommerce',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

pool.getConnection()
  .then(connection => {
    console.log('✅ Conectado a la base de datos MySQL/MariaDB');
    connection.release();
  })
  .catch(error => {
    console.error('❌ Error al conectar a la base de datos:', error.message);
  });

module.exports = pool;
