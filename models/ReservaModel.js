const db = require('../helpers/db');

exports.todas = () => db.leer('reservas');
exports.buscar = id => db.leer('reservas').find(x => x.id === id);
exports.crear = datos => {
  const lista = db.leer('reservas');
  const nueva = { id: db.siguienteId(lista), estado: 'pendiente', ...datos };
  lista.push(nueva);
  db.guardar('reservas', lista);
  return nueva;
};
exports.actualizar = (id, cambios) => {
  const lista = db.leer('reservas');
  const r = lista.find(x => x.id === id);
  if (!r) return null;
  Object.assign(r, cambios);
  db.guardar('reservas', lista);
  return r;
};
