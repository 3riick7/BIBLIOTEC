const db = require('../helpers/db');

exports.todos = () => db.leer('socios');
exports.buscar = id => db.leer('socios').find(x => x.id === id);
exports.crear = datos => {
  const lista = db.leer('socios');
  const nuevo = { id: db.siguienteId(lista), ...datos };
  lista.push(nuevo);
  db.guardar('socios', lista);
  return nuevo;
};
exports.actualizar = (id, cambios) => {
  const lista = db.leer('socios');
  const i = lista.findIndex(x => x.id === id);
  if (i === -1) return null;
  lista[i] = { ...lista[i], ...cambios, id };
  db.guardar('socios', lista);
  return lista[i];
};
exports.eliminar = id => {
  const lista = db.leer('socios');
  const nueva = lista.filter(x => x.id !== id);
  db.guardar('socios', nueva);
  return nueva.length !== lista.length;
};
