export function formatearFechaHora(date) {
  // Validación para evitar valores inválidos
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  const opciones = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Intl.DateTimeFormat("es-AR", opciones).format(date);
}
