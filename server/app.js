const express = require("express")
const jwt = require('jsonwebtoken')
const app = express()
const puerto = 3000
const baseURL = "./emercado-api-main/"
let cat = require( baseURL + 'cats/cat.json')
const SECRET_KEY = 'mi_clave_secreta_super_segura_123' 
// let cats_products = require( baseURL + 'cats_products/cat_products.json')
app.use(express.json())


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

app.get('/cat', (req , res) => {
    res.send(cat)
})

app.get('/cats_products/:id', async (req, res) => {
    const categoryId = req.params.id;
    const fileName = `cats_products/${categoryId}.json`;

    try {
        const data = await readJsonFile(fileName);
        res.json(data);
    } catch (error) {
        res.status(404).json({ error: 'Categoría no encontrada.' });
    }
});


// 2. GET para los detalles de un producto
// Ejemplo de uso: GET /products/40281
app.get('/products/:id', async (req, res) => {
    const productId = req.params.id;
    const fileName = `products/${productId}.json`;

    try {
        const data = await readJsonFile(fileName);
        res.json(data);
    } catch (error) {
        res.status(404).json({ error: 'Producto no encontrado.' });
    }
});

app.get('/', (req , res) => {
    res.send(cat)
})

app.listen(puerto, ()=>{
    console.log("Servidor funcionando")
})