const Socio = require('../models/SocioModel');
const Prestamo = require('../models/PrestamoModel');
const Libro = require('../models/LibroModel');
const MultaService = require('../services/MultaService');
const { ok, error } = require('../helpers/response');

// Permite buscar socios por nombre o DNI con ?q=
exports.listar = (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const socios = Socio.todos().filter(s =>
    s.nombre.toLowerCase().includes(q) || s.dni.includes(q));
  ok(res, socios);
};
exports.obtener = (req, res) => {
  const s = Socio.buscar(parseInt(req.params.id, 10));
  s ? ok(res, s) : error(res, 'Socio no encontrado', 404);
};
exports.crear = (req, res) => {
  const { nombre, dni, correo } = req.body;
  if (!nombre || !/^\d{8}$/.test(dni || '')) return error(res, 'Nombre y DNI de 8 dígitos son obligatorios');
  if (Socio.todos().some(s => s.dni === dni)) return error(res, 'Ya existe un socio con ese DNI');
  ok(res, Socio.crear({ nombre, dni, correo: correo || '' }), 201);
};
exports.actualizar = (req, res) => {
  const s = Socio.actualizar(parseInt(req.params.id, 10), req.body);
  s ? ok(res, s) : error(res, 'Socio no encontrado', 404);
};
exports.eliminar = (req, res) => {
  Socio.eliminar(parseInt(req.params.id, 10))
    ? ok(res, { eliminado: true })
    : error(res, 'Socio no encontrado', 404);
};

// Historial de préstamos de un socio, del más reciente al más antiguo
exports.historial = (req, res) => {
  const socio = Socio.buscar(parseInt(req.params.id, 10));
  if (!socio) return error(res, 'Socio no encontrado', 404);
  const prestamos = Prestamo.deSocio(socio.id).sort((a, b) => b.id - a.id).map(p => ({
    ...p, libro: (Libro.buscar(p.idLibro) || {}).titulo || '–', estadoMulta: MultaService.estado(p)
  }));
  ok(res, { socio, prestamos, total: prestamos.length,
    activos: prestamos.filter(p => !p.devuelto).length, multaPendiente: MultaService.pendienteDeSocio(socio.id) });
};
