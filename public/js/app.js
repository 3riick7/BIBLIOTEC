const api = async (url, opciones) => (await fetch('/api' + url, opciones)).json();
const json = (metodo, datos) => ({ method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
const $ = sel => document.querySelector(sel);
const hoy = () => new Date().toISOString().slice(0, 10);
const fecha = f => f ? new Date(f + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) : '–';

let libros = [], socios = [], prestamos = [], filtro = 'todos';
const soles = n => 'S/ ' + Number(n || 0).toFixed(2);

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
  filtrarLibros();
  cargarCategorias();
  pintarSocios(socios);
  pintarPrestamos();
  $('#sel-libro').innerHTML = libros.map(l =>
    `<option value="${l.id}" ${l.disponibles < 1 ? 'disabled' : ''}>${l.titulo} (${l.disponibles} disp.)</option>`).join('');
  $('#sel-socio').innerHTML = socios.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
  pintarReporte((await api('/reportes/resumen')).datos);
  pintarMultas((await api('/multas')).datos);
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
  $('#r-multas').textContent = soles(r.multas.pendiente);
  $('#r-multas-det').textContent = `${r.multas.cantidadPendientes} por cobrar · ${soles(r.multas.enCurso)} en curso`;
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
let categoria = '';
const COLORES = { 'Novela': ['1f4d3a', 'e9d8a6'], 'Cuento': ['9b2226', 'f6e7cb'], 'Poesía': ['3d405b', 'f2cc8f'],
  'Infantil': ['e07a5f', 'fff3e0'], 'Historia': ['6b4f2c', 'efe1c6'], 'Ciencia': ['1d3557', 'a8dadc'], 'Otros': ['495057', 'e9ecef'] };

// Portada: la imagen subida o, si no hay, una portada generada con el color de su categoría
function portada(l) {
  if (l.portada) return `<img class="portada" src="${l.portada}" alt="Portada de ${l.titulo}">`;
  const [fondo, texto] = COLORES[l.categoria] || COLORES.Otros;
  return `<div class="portada generada" style="--fondo:#${fondo};--texto:#${texto}">
    <span class="p-cat">${l.categoria || ''}</span><strong>${l.titulo}</strong><span class="p-autor">${l.autor}</span></div>`;
}

function pintarLibros(lista) {
  $('#catalogo').innerHTML = lista.length ? lista.map(l => {
    const pct = l.ejemplares ? l.disponibles / l.ejemplares * 100 : 0;
    return `<article class="libro">
      ${portada(l)}
      <div class="libro-info">
        <span class="etiqueta">${l.categoria || 'Otros'}</span>
        <strong>${l.titulo}</strong><span class="sub">${l.autor}</span>
        <div class="disp"><div class="barra"><div style="width:${pct}%"></div></div>${l.disponibles}/${l.ejemplares}</div>
        <div class="acciones">
          <button class="secundario" onclick="elegirPortada(${l.id})">Portada</button>
          <button class="secundario peligro" onclick="eliminarLibro(${l.id})">Eliminar</button>
        </div>
      </div></article>`;
  }).join('') : '<p class="vacio">No se encontraron libros.</p>';
}

async function cargarCategorias() {
  const cats = (await api('/libros/categorias')).datos;
  $('#sel-categoria').innerHTML = cats.map(c => `<option>${c.nombre}</option>`).join('');
  $('#filtro-categorias').innerHTML = [`<button class="chip ${categoria ? '' : 'activo'}" data-cat="">Todas</button>`]
    .concat(cats.filter(c => c.libros).map(c => `<button class="chip ${categoria === c.nombre ? 'activo' : ''}" data-cat="${c.nombre}">${c.nombre} <small>${c.libros}</small></button>`)).join('');
  document.querySelectorAll('#filtro-categorias .chip').forEach(b => b.onclick = () => { categoria = b.dataset.cat; filtrarLibros(); cargarCategorias(); });
}
async function filtrarLibros() {
  const q = encodeURIComponent($('#buscar').value);
  pintarLibros((await api(`/libros?q=${q}&categoria=${encodeURIComponent(categoria)}`)).datos);
}
$('#buscar').oninput = filtrarLibros;

const leerImagen = archivo => new Promise((ok, mal) => {
  if (archivo.size > 2 * 1024 * 1024) return mal(new Error('La portada no puede pesar más de 2 MB'));
  const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = mal; r.readAsDataURL(archivo);
});
async function subirPortada(id, archivo) {
  try {
    const r = await api(`/libros/${id}/portada`, json('POST', { imagen: await leerImagen(archivo) }));
    if (!r.ok) throw new Error(r.mensaje);
    return true;
  } catch (e) { aviso(e.message, true); return false; }
}
$('#form-libro input[name=portada]').onchange = e => ($('#nombre-portada').textContent = e.target.files[0] ? e.target.files[0].name : 'Portada…');
$('#form-libro').onsubmit = async e => {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(e.target));
  const archivo = e.target.portada.files[0];
  delete datos.portada;
  const r = await api('/libros', json('POST', datos));
  if (!r.ok) return aviso(r.mensaje, true);
  if (archivo) await subirPortada(r.datos.id, archivo);
  aviso(`Libro “${r.datos.titulo}” agregado`);
  e.target.reset(); $('#nombre-portada').textContent = 'Portada…';
  cargar();
};
let libroPortada = null;
window.elegirPortada = id => { libroPortada = id; $('#cambiar-portada').click(); };
$('#cambiar-portada').onchange = async e => {
  const archivo = e.target.files[0]; e.target.value = '';
  if (archivo && await subirPortada(libroPortada, archivo)) { aviso('Portada actualizada'); cargar(); }
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
    return `<tr><td><strong>${s.nombre}</strong></td><td>${s.dni}</td><td>${s.correo || '–'}</td><td>${activos} de 3</td>
      <td><button class="secundario" onclick="verHistorial(${s.id})">Historial</button></td></tr>`;
  }).join('') : '<tr><td colspan="5" class="vacio">No se encontraron socios.</td></tr>';
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
    const accion = p.devuelto ? `<span class="sub">${fecha(p.fechaDevolucion)}</span>${p.multa ? `<span class="multa">Multa ${soles(p.multa)}${p.multaPagada ? ' · pagada' : ''}</span>` : ''}`
      : `<button class="secundario" onclick="devolver(${p.id})">Devolver</button>`;
    return `<tr><td><strong>${nombreLibro(p.idLibro)}</strong></td><td>${nombreSocio(p.idSocio)}</td>
      <td>${fecha(p.fechaPrestamo)}</td><td>${fecha(p.fechaLimite)}</td>
      <td><span class="estado ${e}">${etiqueta[e]}</span></td><td>${accion}</td></tr>`;
  }).join('') : '<tr><td colspan="6" class="vacio">No hay préstamos en esta categoría.</td></tr>';
}
document.querySelectorAll('#vista-prestamos .chip').forEach(c => c.onclick = () => {
  filtro = c.dataset.filtro;
  document.querySelectorAll('#vista-prestamos .chip').forEach(x => x.classList.toggle('activo', x === c));
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

// ---------- Multas
const ETIQ_MULTA = { pendiente: 'Pendiente', pagada: 'Pagada', 'en curso': 'En curso' };
function pintarMultas({ multas, totales }) {
  $('#m-pendiente').textContent = soles(totales.pendiente);
  $('#m-cantidad').textContent = `${totales.cantidadPendientes} multa(s) por cobrar`;
  $('#m-curso').textContent = soles(totales.enCurso);
  $('#m-cobrado').textContent = soles(totales.cobrado);
  $('#tarifa-multa').textContent = `${soles(totales.tarifaPorDia)} por cada día de atraso. Un socio con multas pendientes no puede pedir nuevos préstamos.`;
  const b = $('#badge-multas'); b.hidden = !totales.cantidadPendientes; b.textContent = totales.cantidadPendientes;
  $('#tabla-multas tbody').innerHTML = multas.length ? multas.map(m => `<tr>
      <td><strong>${m.socio}</strong></td><td>${m.libro}</td><td>${fecha(m.fechaLimite)}</td><td>${m.diasAtraso}</td><td><strong>${soles(m.monto)}</strong></td>
      <td><span class="estado ${m.estado.replace(' ', '')}">${ETIQ_MULTA[m.estado]}</span></td>
      <td>${m.estado === 'pendiente' ? `<button class="primario" onclick="pagarMulta(${m.idPrestamo})">Registrar pago</button>`
        : (m.estado === 'pagada' ? `<span class="sub">pagó ${fecha(m.fechaPago)}</span>` : '<span class="sub">falta devolver</span>')}</td></tr>`).join('')
    : '<tr><td colspan="7" class="vacio">No hay multas registradas.</td></tr>';
}
window.pagarMulta = async id => {
  const r = await api(`/multas/${id}/pagar`, { method: 'PUT' });
  aviso(r.ok ? `Pago de ${soles(r.datos.multa)} registrado` : r.mensaje, !r.ok);
  cargar();
};

// ---------- Historial del socio
window.verHistorial = async id => {
  const h = (await api(`/socios/${id}/historial`)).datos;
  $('#h-nombre').textContent = h.socio.nombre;
  $('#h-resumen').textContent = `DNI ${h.socio.dni} · ${h.total} préstamo(s), ${h.activos} activo(s) · multa pendiente ${soles(h.multaPendiente)}`;
  $('#h-filas').innerHTML = h.prestamos.length ? h.prestamos.map(p => {
    const e = estadoDe(p);
    return `<tr><td><strong>${p.libro}</strong></td><td>${fecha(p.fechaPrestamo)}</td><td>${fecha(p.fechaLimite)}</td><td>${fecha(p.fechaDevolucion)}</td>
      <td><span class="estado ${e}">${{ activo: 'Activo', atrasado: 'Atrasado', devuelto: 'Devuelto' }[e]}</span></td>
      <td>${p.multa ? soles(p.multa) + (p.multaPagada ? ' (pagada)' : ' (pendiente)') : '–'}</td></tr>`;
  }).join('') : '<tr><td colspan="6" class="vacio">Este socio aún no tiene préstamos.</td></tr>';
  $('#dlg-historial').showModal();
};

$('#fecha-hoy').textContent = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
cargar();
