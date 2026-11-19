const fs = require('fs');
const path = require('path');

const CARPETA = path.join(__dirname, '..', 'public', 'portadas');
const TIPOS = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

// Guarda una imagen recibida como data URL (data:image/png;base64,...) y devuelve su ruta pública
exports.guardar = (idLibro, dataUrl) => {
  const m = /^data:(image\/(?:png|jpeg|webp));base64,(.+)$/.exec(dataUrl || '');
  if (!m) throw new Error('La portada debe ser una imagen PNG, JPG o WEBP');
  const bytes = Buffer.from(m[2], 'base64');
  if (bytes.length > MAX_BYTES) throw new Error('La portada no puede pesar más de 2 MB');
  fs.mkdirSync(CARPETA, { recursive: true });
  const nombre = `libro-${idLibro}-${Date.now()}.${TIPOS[m[1]]}`;
  fs.writeFileSync(path.join(CARPETA, nombre), bytes);
  return 'portadas/' + nombre;
};

// Borra una portada subida anteriormente (si existe)
exports.borrar = ruta => {
  if (!ruta || !ruta.startsWith('portadas/')) return;
  const archivo = path.join(__dirname, '..', 'public', ruta);
  if (fs.existsSync(archivo)) fs.unlinkSync(archivo);
};
