const db = require('../helpers/db');

exports.todos = () => db.leer('prestamos');
exports.buscar = id => db.leer('prestamos').find(x => x.id === id);
exports.activosDeSocio = idSocio =>
  db.leer('prestamos').filter(p => p.idSocio === idSocio && !p.devuelto);
exports.crear = datos => {
  const lista = db.leer('prestamos');
  const nuevo = { id: db.siguienteId(lista), devuelto: false, ...datos };
  lista.push(nuevo);
  db.guardar('prestamos', lista);
  return nuevo;
};
exports.marcarDevuelto = (id, fecha) => {
  const lista = db.leer('prestamos');
  const p = lista.find(x => x.id === id);
  if (!p) return null;
  p.devuelto = true;
  p.fechaDevolucion = fecha;
  db.guardar('prestamos', lista);
  return p;
};
