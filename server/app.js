
const express = require("express")
const routes = require("./routes");
const jwt = require('jsonwebtoken')
const app = express()
const baseURL = "./emercado-api-main/"
let cat = require( baseURL + 'cats/cat.json')
const SECRET_KEY = 'mi_clave_secreta_super_segura_123' 
// let cats_products = require( baseURL + 'cats_products/cat_products.json')

const puerto = 3000;

// Middlewares globales
app.use(express.json());


    // Autoriza el acceso mediante el token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.sendStatus(401); // 401 No autorizado si no hay token
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.sendStatus(403); // 403 Prohibido si el token no es válido
        }
        req.user = user; 
        next(); 
        });
    }


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
});

// Middleware aplicado a las rutas
app.use("/", authenticateToken, routes);

app.listen(puerto, () => {
  console.log(`✓ Servidor funcionando en http://localhost:${puerto}`);
})

module.exports = app;