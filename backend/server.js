const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ 
        message: 'API Ecommerce funcionando',
        status: 'OK',
        endpoints: {
            health: 'GET /health',
            initDb: 'GET /init-db',
            cart: 'POST /cart'
        }
    });
});

app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ ok: true, message: 'Base de datos conectada correctamente' });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

app.get('/init-db', async (req, res) => {
    try {
        let sqlPath = path.join(__dirname, 'ecommerce.sql');
        if (!fs.existsSync(sqlPath)) {
            sqlPath = path.join(__dirname, '..', 'backend', 'ecommerce.sql');
        }
        if (!fs.existsSync(sqlPath)) {
            return res.status(404).json({ ok: false, error: 'Archivo ecommerce.sql no encontrado' });
        }

        const sql = await fs.promises.readFile(sqlPath, 'utf8');

        const tmpConn = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: 'ecommerce_user', 
            password: '2025',  
            database: 'ecommerce',   
            multipleStatements: true
        });
        try {
            await tmpConn.query(sql);
            res.json({ ok: true, message: 'Base de datos inicializada correctamente' });
        } finally {
            await tmpConn.end();
        }
    } catch (err) {
        console.error('Error en /init-db:', err);
        res.status(500).json({ ok: false, error: 'Error al inicializar la base de datos' });
    }
});

app.post('/cart', async (req, res) => {
    try {
        const { usuarioId, items } = req.body;

        if (!usuarioId) {
            return res.status(400).json({ success: false, message: 'Falta el ID del usuario' });
        }
        const conn = await pool.getConnection();
        let transactionStarted = false;
        try {
            const [userRows] = await conn.query('SELECT 1 FROM Usuario WHERE id_usuario = ?', [usuarioId]);
            if (!userRows || userRows.length === 0) {
                return res.status(400).json({ success: false, message: 'Usuario no encontrado' });
            }

            await conn.beginTransaction();
            transactionStarted = true;

            const [insertResult] = await conn.query('INSERT INTO Carrito (id_usuario) VALUES (?)', [usuarioId]);
            const cartId = insertResult.insertId;

            let itemsInserted = 0;
            if (Array.isArray(items) && items.length) {
                for (const item of items) {
                    const productoId = item.productoId || item.id_producto || item.producto || item.producto_id || item.id;
                    const cantidadRaw = item.cantidad ?? item.qty ?? item.cant ?? 1;
                    const cantidad = Number.isInteger(cantidadRaw) ? cantidadRaw : parseInt(cantidadRaw, 10) || 1;

                    if (!productoId) {
                        await conn.rollback();
                        return res.status(400).json({ success: false, message: 'Producto inválido en items' });
                    }
                    const [prodRows] = await conn.query('SELECT 1 FROM Producto WHERE id_producto = ?', [productoId]);
                    if (!prodRows || prodRows.length === 0) {
                        await conn.rollback();
                        return res.status(400).json({ success: false, message: `Producto ${productoId} no encontrado` });
                    }

                    await conn.query('INSERT INTO Carrito_Item (id_carrito, id_producto, cantidad) VALUES (?, ?, ?)', [cartId, productoId, cantidad]);
                    itemsInserted++;
                }
            }

            await conn.commit();
            transactionStarted = false;

            return res.json({ success: true, cartId, itemsInserted });
        } catch (err) {
            if (transactionStarted) {
                try { await conn.rollback(); } catch (e) { console.error('Rollback error:', e); }
            }
            console.error('Error en /cart:', err);
            return res.status(500).json({ success: false, error: 'Error procesando el carrito' });
        } finally {
            conn.release();
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Puerto ${PORT} en uso. Ejecuta con otro puerto: PORT=3001 node backend/server.js`);
        process.exit(1);
    }
    console.error('Error al iniciar servidor:', err);
    process.exit(1);
});

process.on('SIGINT', async () => {
    console.log('\nCerrando servidor...');
    server.close(async () => {
        try {
            await pool.end();
            console.log('Pool de conexiones cerrado. Bye.');
            process.exit(0);
        } catch (e) {
            console.error('Error cerrando pool:', e);
            process.exit(1);
        }
    });
});