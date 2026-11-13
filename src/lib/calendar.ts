/**
 * Generador de archivos iCalendar (.ics) para los eventos.
 *
 * Vive fuera de la ruta (`src/pages/eventos/[id].ics.ts`) para poder testearlo
 * sin levantar Astro ni pegarle a Supabase. La ruta solo orquesta: busca el
 * evento y devuelve la respuesta HTTP.
 */

/** Duración asumida de un evento: el modelo no guarda hora de fin. */
export const EVENT_DURATION_MS = 3 * 60 * 60 * 1000;

export type CalendarEvent = {
  id: string;
  title: string;
  /** Fecha y hora de inicio del evento. */
  start: Date;
  /** URL pública del evento (se incluye para abrirlo desde el calendario). */
  url: string;
  /** Dirección del lugar. */
  location: string;
  /** Descripción ya compuesta (ver `composeEventDescription`). */
  description?: string;
};

/**
 * Fecha en formato UTC compacto que exige iCalendar: `20261113T023000Z`.
 * Lanza si la fecha es inválida para no generar un `.ics` roto.
 */
export function toIcsDate(date: Date): string {
  if (Number.isNaN(date.getTime())) throw new Error('Fecha inválida');

  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/** Escapa los caracteres reservados del estándar (RFC 5545). */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Une los datos disponibles del evento con guiones largos.
 * Descarta vacíos y `null` para no dejar separadores colgando.
 */
export function composeEventDescription(parts: Array<string | null | undefined>): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(' — ');
}

/**
 * Arma el contenido de un `.ics` con un único evento.
 * `now` se puede inyectar para que los tests tengan un DTSTAMP fijo.
 */
export function buildEventCalendar(event: CalendarEvent, options: { now?: Date } = {}): string {
  const now = options.now ?? new Date();
  const end = new Date(event.start.getTime() + EVENT_DURATION_MS);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//La Pulperia MG//Eventos//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@lapulperia-mg`,
    `DTSTAMP:${toIcsDate(now)}`,
    `DTSTART:${toIcsDate(event.start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    `DESCRIPTION:${escapeIcsText(event.description ?? '')}`,
    `URL:${event.url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}
