const fs = require("fs");
const path = require("path");

const categorias = ["remeras", "buzos", "camperas", "medias", "pantalones"];
const extensiones = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const imgDir = path.join(__dirname, "img");
const catalogo = {};

for (const categoria of categorias) {
    const carpeta = path.join(imgDir, categoria);

    if (!fs.existsSync(carpeta)) {
        catalogo[categoria] = [];
        continue;
    }

    catalogo[categoria] = fs
        .readdirSync(carpeta)
        .filter((archivo) => extensiones.has(path.extname(archivo).toLowerCase()))
        .sort((a, b) => a.localeCompare(b, "es"))
        .map((archivo) => ({
            archivo,
            titulo: path.parse(archivo).name,
        }));
}

const contenido = `const catalogoProductos = ${JSON.stringify(catalogo, null, 4)};\n`;

fs.writeFileSync(path.join(__dirname, "catalogo.js"), contenido, "utf8");
console.log("catalogo.js generado correctamente.");
