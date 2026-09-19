function hoy() { return new Date().toISOString().slice(0, 10); }
function sumarDias(fecha, dias) {
  const d = new Date(fecha);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}
module.exports = { hoy, sumarDias };
