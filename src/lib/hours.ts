export const TIME_ZONE = 'America/Argentina/Buenos_Aires';

/** Turno en minutos desde la medianoche del día en que abre. `close` > 1440 cruza medianoche. */
type Shift = { open: number; close: number };

/** 0 = domingo … 6 = sábado (igual que Date.getDay()). */
export const SCHEDULE: Record<number, Shift[]> = {
  0: [{ open: 17 * 60, close: 26 * 60 }], // domingo 17:00 – 02:00
  1: [], // lunes cerrado
  2: [], // martes cerrado
  3: [{ open: 17 * 60, close: 26 * 60 }], // miércoles 17:00 – 02:00
  4: [{ open: 12 * 60, close: 27 * 60 }], // jueves 12:00 – 03:00
  5: [{ open: 12 * 60, close: 27 * 60 }], // viernes 12:00 – 03:00
  6: [{ open: 12 * 60, close: 27 * 60 }], // sábado 12:00 – 03:00
};

/** Agrupación para mostrar en la web. */
export const HOURS_GROUPS = [
  { days: 'Miércoles y domingos', from: '17:00', to: '02:00' },
  { days: 'Jueves a sábados', from: '12:00', to: '03:00' },
  { days: 'Lunes y martes', from: null, to: null },
] as const;

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** Convierte minutos (pueden superar 1440) a "HH:MM". */
export function formatTime(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hh = String(Math.floor(normalized / 60)).padStart(2, '0');
  const mm = String(normalized % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** Día y minutos actuales en horario de Argentina, sin importar el TZ del servidor. */
export function nowInZone(date: Date = new Date()): { weekday: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  const weekday = WEEKDAY_INDEX[get('weekday')] ?? date.getDay();
  const hour = Number(get('hour')) % 24; // algunos entornos devuelven "24" a medianoche
  const minute = Number(get('minute'));

  return { weekday, minutes: hour * 60 + minute };
}

export type OpenStatus =
  | { open: true; closesAt: string; fromYesterday: boolean }
  | { open: false; opensAt: string | null; inDays: number | null; weekday: number | null };

/**
 * Estado abierto/cerrado considerando que los turnos cruzan medianoche:
 * a la 01:00 del jueves el bar sigue abierto por el turno del miércoles.
 */
export function getStatus(date: Date = new Date()): OpenStatus {
  const { weekday, minutes } = nowInZone(date);

  for (const shift of SCHEDULE[weekday] ?? []) {
    if (minutes >= shift.open && minutes < shift.close) {
      return { open: true, closesAt: formatTime(shift.close), fromYesterday: false };
    }
  }

  const yesterday = (weekday + 6) % 7;
  for (const shift of SCHEDULE[yesterday] ?? []) {
    if (shift.close > 1440 && minutes + 1440 >= shift.open && minutes + 1440 < shift.close) {
      return { open: true, closesAt: formatTime(shift.close), fromYesterday: true };
    }
  }

  for (let offset = 0; offset < 7; offset++) {
    const day = (weekday + offset) % 7;
    for (const shift of SCHEDULE[day] ?? []) {
      if (offset === 0 && minutes >= shift.open) continue;
      return { open: false, opensAt: formatTime(shift.open), inDays: offset, weekday: day };
    }
  }

  return { open: false, opensAt: null, inDays: null, weekday: null };
}

const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/** Texto corto para el badge de estado. */
export function describeStatus(status: OpenStatus): string {
  if (status.open) return `Abierto ahora · cierra ${status.closesAt}`;

  if (!status.opensAt) return 'Cerrado';

  if (status.inDays === 0) return `Cerrado · abre hoy ${status.opensAt}`;
  if (status.inDays === 1) return `Cerrado · abre mañana ${status.opensAt}`;
  if (status.inDays !== null && status.weekday !== null) {
    return `Cerrado · abre el ${DAY_NAMES[status.weekday]} ${status.opensAt}`;
  }

  return 'Cerrado';
}
