const ReporteService = require('../services/ReporteService');
const { ok } = require('../helpers/response');

exports.resumen = (req, res) => ok(res, ReporteService.resumen());
