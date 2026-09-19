const Libro = require('../models/LibroModel');
const { ok, error } = require('../helpers/response');

exports.listar = (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const libros = Libro.todos().filter(l =>
    l.titulo.toLowerCase().includes(q) || l.autor.toLowerCase().includes(q));
  ok(res, libros);
};
exports.obtener = (req, res) => {
  const libro = Libro.buscar(parseInt(req.params.id, 10));
  libro ? ok(res, libro) : error(res, 'Libro no encontrado', 404);
};
exports.crear = (req, res) => {
  const { titulo, autor, ejemplares } = req.body;
  if (!titulo || !autor) return error(res, 'Título y autor son obligatorios');
  const n = parseInt(ejemplares, 10) || 1;
  ok(res, Libro.crear({ titulo, autor, ejemplares: n, disponibles: n }), 201);
};
exports.actualizar = (req, res) => {
  const libro = Libro.actualizar(parseInt(req.params.id, 10), req.body);
  libro ? ok(res, libro) : error(res, 'Libro no encontrado', 404);
};
exports.eliminar = (req, res) => {
  Libro.eliminar(parseInt(req.params.id, 10))
    ? ok(res, { eliminado: true })
    : error(res, 'Libro no encontrado', 404);
};
