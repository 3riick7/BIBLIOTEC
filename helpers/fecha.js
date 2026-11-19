function hoy() { return new Date().toISOString().slice(0, 10); }
function sumarDias(fecha, dias) {
  const d = new Date(fecha);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}
// Días completos que van de la fecha a hasta la fecha b (0 si b no es posterior)
function diasEntre(a, b) {
  const ms = new Date(b) - new Date(a);
  return Math.max(0, Math.round(ms / 86400000));
}
module.exports = { hoy, sumarDias, diasEntre };
