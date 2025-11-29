const express = require('express');
const fs = require('fs');
const path = require('path');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Ejecuta el SQL de `ecommerce.sql` para inicializar la base (puede crear DB y tablas)
app.get('/init-db', async (req, res) => {
  try {
    const sqlPath = path.join(__dirname, 'ecommerce.sql');
    if (!fs.existsSync(sqlPath)) return res.status(404).json({ ok: false, error: 'ecommerce.sql not found' });

    const sql = fs.readFileSync(sqlPath, 'utf8');
    const conn = await pool.getConnection();
    try {
      // ejecuta múltiples statements
      await conn.query(sql);
      res.json({ ok: true, message: 'SQL ejecutado' });
    } finally {
      conn.release();
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
