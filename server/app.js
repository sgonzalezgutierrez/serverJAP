
const express = require("express")
const routes = require("./routes");
const jwt = require('jsonwebtoken')
const cors = require("cors");
const app = express()
const baseURL = "./emercado-api-main/"
let cat = require( baseURL + 'cats/cat.json')
const SECRET_KEY = 'mi_clave_secreta_super_segura_123' 
// let cats_products = require( baseURL + 'cats_products/cat_products.json')
app.use(cors());
const puerto = 3000;

app.listen(puerto, () => {
  console.log(`✓ Servidor funcionando en http://localhost:${puerto}`);
app.post('/login', (req, res) => {
    const { username, password } = req.body
    
    if (!username || !password) {
        return res.status(400).json({ 
            error: 'Usuario y contraseña son requeridos' 
        })
    }
    
    // Generar el token JWT
    const token = jwt.sign(
        { 
            username: username,
            loginTime: new Date().toISOString()
        },
        SECRET_KEY,
        { expiresIn: '1h' }
    )
    
    res.json({
        success: true,
        message: 'Login exitoso',
        token: token,
        user: username
    })
})
});

// Middlewares
app.use(express.json());

// Rutas
app.use("/", routes);

module.exports = app;