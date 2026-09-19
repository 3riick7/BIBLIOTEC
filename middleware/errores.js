const { error } = require('../helpers/response');

exports.noEncontrado = (req, res) => error(res, 'Ruta no encontrada', 404);

exports.manejarErrores = (err, req, res, next) => {
  console.error(err);
  error(res, 'Error interno del servidor', 500);
};
