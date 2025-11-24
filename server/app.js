// app.js
const express = require("express");
const routes = require("./routes");

const app = express();

const puerto = 3000;

app.listen(puerto, () => {
  console.log(`✓ Servidor funcionando en http://localhost:${puerto}`);
});

// Middlewares
app.use(express.json());

// Rutas
app.use("/", routes);

module.exports = app;