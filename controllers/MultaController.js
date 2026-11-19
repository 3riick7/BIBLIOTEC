const MultaService = require('../services/MultaService');
const { ok, error } = require('../helpers/response');

exports.listar = (req, res) => ok(res, { multas: MultaService.listar(), totales: MultaService.totales() });
exports.pagar = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return error(res, 'El id del préstamo debe ser numérico');
  try { ok(res, MultaService.pagar(id)); } catch (e) { error(res, e.message); }
};
