const fs = require("fs").promises;
const path = require("path");

// __dirname = /server/model
// Queremos /server/emercado-api-main
const baseDir = path.join(__dirname, "..", "emercado-api-main");

const model = {
  readJsonFile: async (relativePath) => {
    try {
      // relativePath = "cats/cat.json"
      const filePath = path.join(baseDir, relativePath);

      console.log("Leyendo archivo:", filePath);

      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error leyendo:", relativePath, error.message);
      throw new Error(`No se pudo leer el archivo: ${relativePath}`);
    }
  }
};

module.exports = model;
