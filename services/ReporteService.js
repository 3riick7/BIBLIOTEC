const Libro = require('../models/LibroModel');
const Socio = require('../models/SocioModel');
const Prestamo = require('../models/PrestamoModel');
const { hoy } = require('../helpers/fecha');

// Resumen general de la biblioteca para el módulo de reportes
exports.resumen = () => {
  const libros = Libro.todos();
  const prestamos = Prestamo.todos();
  const activos = prestamos.filter(p => !p.devuelto);
  const atrasados = activos.filter(p => p.fechaLimite < hoy());

  // Cuenta cuántas veces se prestó cada libro
  const conteo = {};
  prestamos.forEach(p => { conteo[p.idLibro] = (conteo[p.idLibro] || 0) + 1; });
  const idTop = Object.keys(conteo).sort((a, b) => conteo[b] - conteo[a])[0];
  const masPrestado = idTop ? Libro.buscar(parseInt(idTop, 10)) : null;

  return {
    totalLibros: libros.length,
    totalEjemplares: libros.reduce((s, l) => s + l.ejemplares, 0),
    ejemplaresDisponibles: libros.reduce((s, l) => s + l.disponibles, 0),
    totalSocios: Socio.todos().length,
    prestamosActivos: activos.length,
    prestamosAtrasados: atrasados.length,
    libroMasPrestado: masPrestado ? masPrestado.titulo : null
  };
};
