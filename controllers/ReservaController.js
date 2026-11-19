const ReservaService = require('../services/ReservaService');
const { ok, error } = require('../helpers/response');

exports.listar = (req, res) => ok(res, ReservaService.listar());
exports.reservar = (req, res) => {
  try {
    ok(res, ReservaService.reservar(parseInt(req.body.idLibro, 10), parseInt(req.body.idSocio, 10)), 201);
  } catch (e) { error(res, e.message); }
};
exports.cancelar = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return error(res, 'El id de la reserva debe ser numérico');
  try { ok(res, ReservaService.cancelar(id)); } catch (e) { error(res, e.message); }
};
