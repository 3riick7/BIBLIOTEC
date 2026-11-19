const Prestamo = require('../models/PrestamoModel');
const Libro = require('../models/LibroModel');
const Socio = require('../models/SocioModel');
const { hoy, diasEntre } = require('../helpers/fecha');
const { multaPorDia } = require('../config/config');

const redondear = n => Math.round(n * 100) / 100;

// Multa que corresponde a un préstamo devuelto en la fecha indicada
exports.calcular = (fechaLimite, fechaDevolucion) => {
  const dias = diasEntre(fechaLimite, fechaDevolucion);
  return { diasAtraso: dias, multa: redondear(dias * multaPorDia) };
};

// Estado de la multa de un préstamo: null si no tiene, 'pendiente', 'pagada' o 'en curso' (sigue sin devolver)
exports.estado = p => {
  if (p.devuelto) return p.multa > 0 ? (p.multaPagada ? 'pagada' : 'pendiente') : null;
  return p.fechaLimite < hoy() ? 'en curso' : null;
};

exports.pendienteDeSocio = idSocio =>
  redondear(Prestamo.deSocio(idSocio).filter(p => exports.estado(p) === 'pendiente').reduce((s, p) => s + p.multa, 0));

// Lista de multas con los datos del socio y del libro
exports.listar = () => Prestamo.todos()
  .map(p => {
    const estado = exports.estado(p);
    if (!estado) return null;
    const { diasAtraso, multa } = estado === 'en curso' ? exports.calcular(p.fechaLimite, hoy()) : p;
    const libro = Libro.buscar(p.idLibro) || {};
    const socio = Socio.buscar(p.idSocio) || {};
    return { idPrestamo: p.id, libro: libro.titulo, socio: socio.nombre, idSocio: p.idSocio,
      fechaLimite: p.fechaLimite, fechaDevolucion: p.fechaDevolucion || null, fechaPago: p.fechaPago || null,
      diasAtraso, monto: multa, estado };
  })
  .filter(Boolean)
  .sort((a, b) => ['pendiente', 'en curso', 'pagada'].indexOf(a.estado) - ['pendiente', 'en curso', 'pagada'].indexOf(b.estado));

exports.pagar = idPrestamo => {
  const p = Prestamo.buscar(idPrestamo);
  if (!p) throw new Error('El préstamo no existe');
  if (exports.estado(p) !== 'pendiente') throw new Error('Este préstamo no tiene una multa pendiente');
  return Prestamo.actualizar(idPrestamo, { multaPagada: true, fechaPago: hoy() });
};

exports.totales = () => {
  const lista = exports.listar();
  const suma = est => redondear(lista.filter(m => m.estado === est).reduce((s, m) => s + m.monto, 0));
  return { pendiente: suma('pendiente'), cobrado: suma('pagada'), enCurso: suma('en curso'),
    cantidadPendientes: lista.filter(m => m.estado === 'pendiente').length, tarifaPorDia: multaPorDia };
};
