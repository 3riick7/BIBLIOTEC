const fs = require('fs');
const path = require('path');
const necesarios = ['app.js', 'package.json', 'data/libros.json', 'data/socios.json', 'data/prestamos.json'];
let falta = false;
for (const f of necesarios) {
  if (!fs.existsSync(path.join(__dirname, '..', f))) { console.log('Falta: ' + f); falta = true; }
}
console.log(falta ? 'Verificación con errores' : 'Verificación correcta');
process.exit(falta ? 1 : 0);
