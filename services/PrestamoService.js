const Libro = require('../models/LibroModel');
const Socio = require('../models/SocioModel');
const Prestamo = require('../models/PrestamoModel');
const { hoy, sumarDias } = require('../helpers/fecha');
const { diasPrestamo } = require('../config/config');
const MultaService = require('./MultaService');

const MAX_PRESTAMOS = 3;

exports.prestar = (idLibro, idSocio) => {
  const libro = Libro.buscar(idLibro);
  const socio = Socio.buscar(idSocio);
  if (!libro) throw new Error('El libro no existe');
  if (!socio) throw new Error('El socio no existe');
  if (libro.disponibles < 1) throw new Error('No hay ejemplares disponibles');
  const deuda = MultaService.pendienteDeSocio(idSocio);
  if (deuda > 0) throw new Error(`El socio tiene multas pendientes por S/ ${deuda.toFixed(2)}`);
  if (Prestamo.activosDeSocio(idSocio).length >= MAX_PRESTAMOS)
    throw new Error(`El socio ya tiene ${MAX_PRESTAMOS} préstamos activos`);

  Libro.actualizar(idLibro, { disponibles: libro.disponibles - 1 });
  return Prestamo.crear({
    idLibro, idSocio,
    fechaPrestamo: hoy(),
    fechaLimite: sumarDias(hoy(), diasPrestamo)
  });
};

exports.devolver = idPrestamo => {
  const p = Prestamo.buscar(idPrestamo);
  if (!p) throw new Error('El préstamo no existe');
  if (p.devuelto) throw new Error('El préstamo ya fue devuelto');
  const libro = Libro.buscar(p.idLibro);
  Libro.actualizar(p.idLibro, { disponibles: libro.disponibles + 1 });
  // Si se devuelve después de la fecha límite se registra la multa
  const { diasAtraso, multa } = MultaService.calcular(p.fechaLimite, hoy());
  return Prestamo.marcarDevuelto(idPrestamo, hoy(), multa > 0 ? { diasAtraso, multa, multaPagada: false } : {});
};

exports.atrasados = () =>
  Prestamo.todos().filter(p => !p.devuelto && p.fechaLimite < hoy());
