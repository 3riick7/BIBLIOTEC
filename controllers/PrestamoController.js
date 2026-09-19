const Prestamo = require('../models/PrestamoModel');
const PrestamoService = require('../services/PrestamoService');
const { ok, error } = require('../helpers/response');

exports.listar = (req, res) => ok(res, Prestamo.todos());
exports.atrasados = (req, res) => ok(res, PrestamoService.atrasados());
exports.prestar = (req, res) => {
  try {
    const p = PrestamoService.prestar(parseInt(req.body.idLibro, 10), parseInt(req.body.idSocio, 10));
    ok(res, p, 201);
  } catch (e) { error(res, e.message); }
};
exports.devolver = (req, res) => {
  try {
    ok(res, PrestamoService.devolver(parseInt(req.params.id, 10)));
  } catch (e) { error(res, e.message); }
};
