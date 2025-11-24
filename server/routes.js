const express = require("express");
const controller = require("./controller");

const router = express.Router();

// Categorías
router.get("/cat", controller.getCategories);
router.get("/cats_products/:id", controller.getCategoryProducts);

// Productos
router.get("/products/:id", controller.getProduct);

// Comentarios
router.get("/api/products-comments/:id", controller.getProductComments);

// Ruta raíz
router.get("/", controller.getCategories);

module.exports = router;
