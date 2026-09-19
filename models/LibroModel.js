const db = require('../helpers/db');

exports.todos = () => db.leer('libros');
exports.buscar = id => db.leer('libros').find(x => x.id === id);
exports.crear = datos => {
  const lista = db.leer('libros');
  const nuevo = { id: db.siguienteId(lista), ...datos };
  lista.push(nuevo);
  db.guardar('libros', lista);
  return nuevo;
};
exports.actualizar = (id, cambios) => {
  const lista = db.leer('libros');
  const i = lista.findIndex(x => x.id === id);
  if (i === -1) return null;
  lista[i] = { ...lista[i], ...cambios, id };
  db.guardar('libros', lista);
  return lista[i];
};
exports.eliminar = id => {
  const lista = db.leer('libros');
  const nueva = lista.filter(x => x.id !== id);
  db.guardar('libros', nueva);
  return nueva.length !== lista.length;
};
