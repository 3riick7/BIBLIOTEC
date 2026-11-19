const Reserva = require('../models/ReservaModel');
const Libro = require('../models/LibroModel');
const Socio = require('../models/SocioModel');
const Prestamo = require('../models/PrestamoModel');
const MultaService = require('./MultaService');
const { hoy, sumarDias } = require('../helpers/fecha');

const DIAS_PARA_RECOGER = 3;
const activa = r => r.estado === 'pendiente' || r.estado === 'lista';

// Cola de espera de un libro: reservas pendientes por orden de llegada
const cola = idLibro => Reserva.todas().filter(r => r.idLibro === idLibro && r.estado === 'pendiente').sort((a, b) => a.id - b.id);

exports.reservar = (idLibro, idSocio) => {
  const libro = Libro.buscar(idLibro);
  if (!libro) throw new Error('El libro no existe');
  if (!Socio.buscar(idSocio)) throw new Error('El socio no existe');
  if (libro.disponibles > 0) throw new Error('El libro tiene ejemplares disponibles: registra el préstamo directamente');
  if (Reserva.todas().some(r => r.idLibro === idLibro && r.idSocio === idSocio && activa(r)))
    throw new Error('El socio ya tiene una reserva activa de este libro');
  if (Prestamo.activosDeSocio(idSocio).some(p => p.idLibro === idLibro)) throw new Error('El socio ya tiene este libro prestado');
  const deuda = MultaService.pendienteDeSocio(idSocio);
  if (deuda > 0) throw new Error(`El socio tiene multas pendientes por S/ ${deuda.toFixed(2)}`);
  return Reserva.crear({ idLibro, idSocio, fecha: hoy() });
};

// Al volver un ejemplar, se aparta para el primero de la cola. Devuelve la reserva o null si no hay cola.
exports.apartar = idLibro => {
  const primera = cola(idLibro)[0];
  if (!primera) return null;
  return Reserva.actualizar(primera.id, { estado: 'lista', fechaAviso: hoy(), recogerHasta: sumarDias(hoy(), DIAS_PARA_RECOGER) });
};

// Reserva lista (ejemplar apartado) de un socio para un libro, si existe
exports.listaDe = (idLibro, idSocio) =>
  Reserva.todas().find(r => r.idLibro === idLibro && r.idSocio === idSocio && r.estado === 'lista');

exports.cumplir = id => Reserva.actualizar(id, { estado: 'cumplida', fechaCumplida: hoy() });

exports.cancelar = id => {
  const r = Reserva.buscar(id);
  if (!r) throw new Error('La reserva no existe');
  if (!activa(r)) throw new Error('La reserva ya no está activa');
  const cancelada = Reserva.actualizar(id, { estado: 'cancelada', fechaCancelacion: hoy() });
  // Si tenía un ejemplar apartado, pasa al siguiente de la cola o vuelve al catálogo
  if (r.estado === 'lista' && !exports.apartar(r.idLibro)) {
    const libro = Libro.buscar(r.idLibro);
    Libro.actualizar(r.idLibro, { disponibles: libro.disponibles + 1 });
  }
  return cancelada;
};

exports.listar = () => Reserva.todas()
  .map(r => ({
    ...r,
    libro: (Libro.buscar(r.idLibro) || {}).titulo || '–',
    socio: (Socio.buscar(r.idSocio) || {}).nombre || '–',
    posicion: r.estado === 'pendiente' ? cola(r.idLibro).findIndex(x => x.id === r.id) + 1 : null
  }))
  .sort((a, b) => ['lista', 'pendiente', 'cumplida', 'cancelada'].indexOf(a.estado) - ['lista', 'pendiente', 'cumplida', 'cancelada'].indexOf(b.estado) || a.id - b.id);

exports.totales = () => {
  const todas = Reserva.todas();
  return { pendientes: todas.filter(r => r.estado === 'pendiente').length, listas: todas.filter(r => r.estado === 'lista').length };
};
