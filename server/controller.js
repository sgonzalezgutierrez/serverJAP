const fs = require("fs").promises;
const path = require("path");

// Base absoluta hacia /server/emercado-api-main
const BASE_DIR = path.join(__dirname, "emercado-api-main");

// Helper para leer archivos JSON
async function readJSON(relativePath) {
  try {
    const fullPath = path.join(BASE_DIR, relativePath);

    const raw = await fs.readFile(fullPath, "utf-8");
    return JSON.parse(raw);

  } catch (err) {
    console.error(`Error leyendo JSON: ${relativePath}`, err.message);
    throw new Error("No se pudo leer el archivo JSON");
  }
}

const controller = {

  // Obtener categorías
  getCategories: async (req, res) => {
    const fileName = `cats/cat.json`;

    try {
        const data = await readJSON(fileName);
        res.json(data);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Obtener productos de una categoría
  getCategoryProducts: async (req, res) => {
    try {
      const { id } = req.params;

      const products = await readJSON(`cats_products/${id}.json`);
      res.json(products);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Obtener un producto por ID
  getProduct: async (req, res) => {
    try {
      const { id } = req.params;

      const product = await readJSON(`products/${id}.json`);
      res.json(product);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Obtener comentarios de un producto
  getProductComments: async (req, res) => {
    try {
      const { id } = req.params;

      const comments = await readJSON(`products_comments/${id}.json`);
      res.json(comments);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = controller;
