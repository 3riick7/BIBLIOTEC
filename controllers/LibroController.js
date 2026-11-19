const Libro = require('../models/LibroModel');
const Portada = require('../helpers/portada');
const { ok, error } = require('../helpers/response');

const CATEGORIAS = ['Novela', 'Cuento', 'Poesía', 'Infantil', 'Historia', 'Ciencia', 'Otros'];

// Lista libros; permite buscar por título o autor (?q=) y filtrar por categoría (?categoria=)
exports.listar = (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const cat = req.query.categoria;
  const libros = Libro.todos().filter(l =>
    (l.titulo.toLowerCase().includes(q) || l.autor.toLowerCase().includes(q)) &&
    (!cat || l.categoria === cat));
  ok(res, libros);
};
exports.categorias = (req, res) => {
  const libros = Libro.todos();
  ok(res, CATEGORIAS.map(nombre => ({ nombre, libros: libros.filter(l => l.categoria === nombre).length })));
};
exports.obtener = (req, res) => {
  const libro = Libro.buscar(parseInt(req.params.id, 10));
  libro ? ok(res, libro) : error(res, 'Libro no encontrado', 404);
};
exports.crear = (req, res) => {
  const { titulo, autor, ejemplares, categoria } = req.body;
  if (!titulo || !autor) return error(res, 'Título y autor son obligatorios');
  if (categoria && !CATEGORIAS.includes(categoria)) return error(res, 'Categoría no válida');
  const n = parseInt(ejemplares, 10) || 1;
  ok(res, Libro.crear({ titulo, autor, ejemplares: n, disponibles: n, categoria: categoria || 'Otros', portada: null }), 201);
};
exports.actualizar = (req, res) => {
  const libro = Libro.actualizar(parseInt(req.params.id, 10), req.body);
  libro ? ok(res, libro) : error(res, 'Libro no encontrado', 404);
};
exports.subirPortada = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const libro = Libro.buscar(id);
  if (!libro) return error(res, 'Libro no encontrado', 404);
  try {
    const ruta = Portada.guardar(id, req.body.imagen);
    Portada.borrar(libro.portada);
    ok(res, Libro.actualizar(id, { portada: ruta }));
  } catch (e) { error(res, e.message); }
};
exports.eliminar = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const libro = Libro.buscar(id);
  if (!libro) return error(res, 'Libro no encontrado', 404);
  Portada.borrar(libro.portada);
  Libro.eliminar(id);
  ok(res, { eliminado: true });
};
