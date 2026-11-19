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
exports.actualizar = (id, cambios) => {
  const lista = db.leer('prestamos');
  const p = lista.find(x => x.id === id);
  if (!p) return null;
  Object.assign(p, cambios);
  db.guardar('prestamos', lista);
  return p;
};
exports.marcarDevuelto = (id, fecha, extra = {}) =>
  exports.actualizar(id, { devuelto: true, fechaDevolucion: fecha, ...extra });
exports.deSocio = idSocio => db.leer('prestamos').filter(p => p.idSocio === idSocio);
