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

/** Día calendario (en la zona del bar) expresado como timestamp UTC a medianoche. */
function dayStamp(date: Date): number {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: EVENT_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return Date.UTC(get('year'), get('month') - 1, get('day'));
}

/**
 * Etiqueta relativa ("Hoy", "Mañana", "En 3 días") comparando días calendario
 * en horario de Argentina. Devuelve null si el evento está lejos o es inválido.
 */
export function relativeDayLabel(iso: string, now: Date = new Date()): string | null {
  const event = new Date(iso);
  if (Number.isNaN(event.getTime())) return null;

  const diff = Math.round((dayStamp(event) - dayStamp(now)) / 86_400_000);

  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  if (diff > 1 && diff <= 6) return `En ${diff} días`;
  return null;
}

