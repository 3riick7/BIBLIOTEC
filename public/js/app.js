const api = async (url, opciones) => (await fetch('/api' + url, opciones)).json();
let libros = [], socios = [];

async function cargar() {
  libros = (await api('/libros')).datos;
  socios = (await api('/socios')).datos;
  const prestamos = (await api('/prestamos')).datos;
  pintarLibros(libros);
  document.getElementById('sel-libro').innerHTML =
    libros.map(l => `<option value="${l.id}">${l.titulo}</option>`).join('');
  document.getElementById('sel-socio').innerHTML =
    socios.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
  pintarPrestamos(prestamos);
  pintarReporte((await api('/reportes/resumen')).datos);
}

function pintarReporte(r) {
  document.getElementById('reporte').innerHTML = `
    <li>Libros registrados: ${r.totalLibros} (${r.ejemplaresDisponibles}/${r.totalEjemplares} ejemplares disponibles)</li>
    <li>Socios registrados: ${r.totalSocios}</li>
    <li>Préstamos activos: ${r.prestamosActivos}</li>
    <li>Préstamos atrasados: ${r.prestamosAtrasados}</li>
    <li>Libro más prestado: ${r.libroMasPrestado || 'Sin préstamos todavía'}</li>`;
}

function pintarLibros(lista) {
  document.querySelector('#tabla-libros tbody').innerHTML = lista.map(l =>
    `<tr><td>${l.titulo}</td><td>${l.autor}</td><td>${l.disponibles}/${l.ejemplares}</td></tr>`).join('');
}

function pintarPrestamos(lista) {
  document.querySelector('#tabla-prestamos tbody').innerHTML = lista.map(p => {
    const l = libros.find(x => x.id === p.idLibro), s = socios.find(x => x.id === p.idSocio);
    const hoy = new Date().toISOString().slice(0, 10);
    const estado = !p.devuelto && p.fechaLimite < hoy ? ' <strong>(Atrasado)</strong>' : '';
    const accion = p.devuelto ? 'Devuelto' : `<button onclick="devolver(${p.id})">Devolver</button>`;
    return `<tr><td>${l ? l.titulo : '-'}</td><td>${s ? s.nombre : '-'}</td><td>${p.fechaLimite}${estado}</td><td>${accion}</td></tr>`;
  }).join('');
}

document.getElementById('buscar').oninput = async e =>
  pintarLibros((await api('/libros?q=' + encodeURIComponent(e.target.value))).datos);

document.getElementById('form-prestamo').onsubmit = async e => {
  e.preventDefault();
  const r = await api('/prestamos', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idLibro: sel('sel-libro'), idSocio: sel('sel-socio') })
  });
  document.getElementById('mensaje').textContent = r.ok ? 'Préstamo registrado' : r.mensaje;
  cargar();
};
const sel = id => document.getElementById(id).value;
window.devolver = async id => { await api(`/prestamos/${id}/devolver`, { method: 'PUT' }); cargar(); };

cargar();
