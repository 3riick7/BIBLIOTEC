const api = async (url, opciones) => (await fetch('/api' + url, opciones)).json();
const json = (metodo, datos) => ({ method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
const $ = sel => document.querySelector(sel);
const hoy = () => new Date().toISOString().slice(0, 10);
const fecha = f => f ? new Date(f + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) : '–';

let libros = [], socios = [], prestamos = [], filtro = 'todos';

function aviso(texto, esError = false) {
  const a = $('#aviso');
  a.textContent = texto;
  a.className = 'aviso ver' + (esError ? ' error' : '');
  clearTimeout(a.t);
  a.t = setTimeout(() => (a.className = 'aviso'), 2800);
}

const estadoDe = p => p.devuelto ? 'devuelto' : (p.fechaLimite < hoy() ? 'atrasado' : 'activo');

// ---------- Navegación entre vistas
document.querySelectorAll('.nav').forEach(b => b.onclick = () => {
  document.querySelectorAll('.nav').forEach(x => x.classList.toggle('activo', x === b));
  document.querySelectorAll('.vista').forEach(v => v.classList.toggle('activa', v.id === 'vista-' + b.dataset.vista));
});

// ---------- Carga general
async function cargar() {
  [libros, socios, prestamos] = await Promise.all([api('/libros'), api('/socios'), api('/prestamos')]).then(r => r.map(x => x.datos));
  pintarLibros(libros);
  pintarSocios(socios);
  pintarPrestamos();
  $('#sel-libro').innerHTML = libros.map(l =>
    `<option value="${l.id}" ${l.disponibles < 1 ? 'disabled' : ''}>${l.titulo} (${l.disponibles} disp.)</option>`).join('');
  $('#sel-socio').innerHTML = socios.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
  pintarReporte((await api('/reportes/resumen')).datos);
}

// ---------- Panel
function pintarReporte(r) {
  $('#r-libros').textContent = r.totalLibros;
  $('#r-ejemplares').textContent = `${r.totalEjemplares} ejemplares`;
  $('#r-socios').textContent = r.totalSocios;
  $('#r-activos').textContent = r.prestamosActivos;
  $('#r-atrasados').textContent = r.prestamosAtrasados;
  $('#r-top').textContent = r.libroMasPrestado || 'Aún no hay préstamos';
  const pct = r.totalEjemplares ? Math.round(r.ejemplaresDisponibles / r.totalEjemplares * 100) : 0;
  $('#barra-disp').style.width = pct + '%';
  $('#r-disp').textContent = `${r.ejemplaresDisponibles} de ${r.totalEjemplares} ejemplares en estantería (${pct}%)`;
  const b = $('#badge-atrasados');
  b.hidden = !r.prestamosAtrasados;
  b.textContent = r.prestamosAtrasados;

  const atrasados = prestamos.filter(p => estadoDe(p) === 'atrasado');
  $('#lista-atrasados').innerHTML = atrasados.length
    ? atrasados.map(p => `<li><span>${nombreLibro(p.idLibro)} · ${nombreSocio(p.idSocio)}</span><span class="estado atrasado">venció ${fecha(p.fechaLimite)}</span></li>`).join('')
    : '<li class="vacio">No hay préstamos atrasados. ¡Todo al día!</li>';
}

const nombreLibro = id => (libros.find(x => x.id === id) || {}).titulo || '–';
const nombreSocio = id => (socios.find(x => x.id === id) || {}).nombre || '–';

// ---------- Libros
function pintarLibros(lista) {
  $('#tabla-libros tbody').innerHTML = lista.length ? lista.map(l => {
    const pct = l.ejemplares ? l.disponibles / l.ejemplares * 100 : 0;
    return `<tr><td><strong>${l.titulo}</strong></td><td>${l.autor}</td>
      <td><div class="disp"><div class="barra"><div style="width:${pct}%"></div></div>${l.disponibles}/${l.ejemplares}</div></td>
      <td><button class="secundario peligro" onclick="eliminarLibro(${l.id})">Eliminar</button></td></tr>`;
  }).join('') : '<tr><td colspan="4" class="vacio">No se encontraron libros.</td></tr>';
}
$('#buscar').oninput = async e => pintarLibros((await api('/libros?q=' + encodeURIComponent(e.target.value))).datos);
$('#form-libro').onsubmit = async e => {
  e.preventDefault();
  const r = await api('/libros', json('POST', Object.fromEntries(new FormData(e.target))));
  aviso(r.ok ? `Libro “${r.datos.titulo}” agregado` : r.mensaje, !r.ok);
  if (r.ok) { e.target.reset(); cargar(); }
};
window.eliminarLibro = async id => {
  if (prestamos.some(p => p.idLibro === id && !p.devuelto)) return aviso('No se puede eliminar: el libro tiene préstamos activos', true);
  const r = await api('/libros/' + id, { method: 'DELETE' });
  aviso(r.ok ? 'Libro eliminado' : r.mensaje, !r.ok);
  cargar();
};

// ---------- Socios
function pintarSocios(lista) {
  $('#tabla-socios tbody').innerHTML = lista.length ? lista.map(s => {
    const activos = prestamos.filter(p => p.idSocio === s.id && !p.devuelto).length;
    return `<tr><td><strong>${s.nombre}</strong></td><td>${s.dni}</td><td>${s.correo || '–'}</td><td>${activos} de 3</td></tr>`;
  }).join('') : '<tr><td colspan="4" class="vacio">No se encontraron socios.</td></tr>';
}
$('#buscar-socio').oninput = async e => pintarSocios((await api('/socios?q=' + encodeURIComponent(e.target.value))).datos);
$('#form-socio').onsubmit = async e => {
  e.preventDefault();
  const r = await api('/socios', json('POST', Object.fromEntries(new FormData(e.target))));
  aviso(r.ok ? `Socio ${r.datos.nombre} registrado` : r.mensaje, !r.ok);
  if (r.ok) { e.target.reset(); cargar(); }
};

// ---------- Préstamos
function pintarPrestamos() {
  const lista = prestamos.filter(p => filtro === 'todos' || estadoDe(p) + 's' === filtro)
    .sort((a, b) => b.id - a.id);
  const etiqueta = { activo: 'Activo', atrasado: 'Atrasado', devuelto: 'Devuelto' };
  $('#tabla-prestamos tbody').innerHTML = lista.length ? lista.map(p => {
    const e = estadoDe(p);
    const accion = p.devuelto ? `<span class="sub">${fecha(p.fechaDevolucion)}</span>`
      : `<button class="secundario" onclick="devolver(${p.id})">Devolver</button>`;
    return `<tr><td><strong>${nombreLibro(p.idLibro)}</strong></td><td>${nombreSocio(p.idSocio)}</td>
      <td>${fecha(p.fechaPrestamo)}</td><td>${fecha(p.fechaLimite)}</td>
      <td><span class="estado ${e}">${etiqueta[e]}</span></td><td>${accion}</td></tr>`;
  }).join('') : '<tr><td colspan="6" class="vacio">No hay préstamos en esta categoría.</td></tr>';
}
document.querySelectorAll('.chip').forEach(c => c.onclick = () => {
  filtro = c.dataset.filtro;
  document.querySelectorAll('.chip').forEach(x => x.classList.toggle('activo', x === c));
  pintarPrestamos();
});
$('#form-prestamo').onsubmit = async e => {
  e.preventDefault();
  const r = await api('/prestamos', json('POST', { idLibro: $('#sel-libro').value, idSocio: $('#sel-socio').value }));
  aviso(r.ok ? `Préstamo registrado. Devolver hasta el ${fecha(r.datos.fechaLimite)}` : r.mensaje, !r.ok);
  cargar();
};
window.devolver = async id => {
  const r = await api(`/prestamos/${id}/devolver`, { method: 'PUT' });
  aviso(r.ok ? 'Devolución registrada' : r.mensaje, !r.ok);
  cargar();
};

$('#fecha-hoy').textContent = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
cargar();
