const fs = require('fs');
const path = require('path');

function ruta(nombre) { return path.join(__dirname, '..', 'data', nombre + '.json'); }
function leer(nombre) { return JSON.parse(fs.readFileSync(ruta(nombre), 'utf8')); }
function guardar(nombre, datos) { fs.writeFileSync(ruta(nombre), JSON.stringify(datos, null, 2)); }
function siguienteId(lista) { return lista.length ? Math.max(...lista.map(x => x.id)) + 1 : 1; }

module.exports = { leer, guardar, siguienteId };
