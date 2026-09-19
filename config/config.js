module.exports = {
  puerto: process.env.PORT || 3000,
  nombre: process.env.NOMBRE_BIBLIOTECA || 'BiblioTec',
  diasPrestamo: parseInt(process.env.DIAS_PRESTAMO, 10) || 7
};
