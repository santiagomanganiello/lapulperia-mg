export const EVENT_TZ = 'America/Argentina/Buenos_Aires';

/**
 * Formatea la fecha de un evento (guardada en UTC) al horario de Argentina.
 */
export function formatEventDate(iso: string) {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return { fecha: iso, hora: '' };

  const fecha = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: EVENT_TZ,
  }).format(dt);

  const hora = new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: EVENT_TZ,
  }).format(dt);

  return {
    fecha: fecha.charAt(0).toUpperCase() + fecha.slice(1),
    hora: `${hora} hs`,
  };
}
