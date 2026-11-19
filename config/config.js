module.exports = {
  puerto: process.env.PORT || 3000,
  nombre: process.env.NOMBRE_BIBLIOTECA || 'BiblioTec',
  diasPrestamo: parseInt(process.env.DIAS_PRESTAMO, 10) || 7,
  multaPorDia: parseFloat(process.env.MULTA_POR_DIA) || 1 // soles por cada día de atraso
};
