import { describe, expect, it } from 'vitest';
import {
  buildEventCalendar,
  composeEventDescription,
  escapeIcsText,
  toIcsDate,
  type CalendarEvent,
} from '../src/lib/calendar';

const event: CalendarEvent = {
  id: 'abc-123',
  title: 'Noche de rock',
  start: new Date('2026-11-12T23:30:00-03:00'),
  url: 'https://lapulperia-mg.vercel.app/eventos/abc-123.ics',
  location: 'Av. Dardo Rocha 396, Monte Grande, Buenos Aires',
  description: 'La Banda — Entradas en puerta',
};

const now = new Date('2026-11-01T12:00:00-03:00');

describe('toIcsDate', () => {
  it('convierte a UTC compacto', () => {
    expect(toIcsDate(new Date('2026-11-12T23:30:00-03:00'))).toBe('20261113T023000Z');
  });

  it('descarta los milisegundos', () => {
    expect(toIcsDate(new Date('2026-11-12T12:00:00.987Z'))).toBe('20261112T120000Z');
  });

  it('lanza con una fecha inválida', () => {
    expect(() => toIcsDate(new Date('nope'))).toThrow('Fecha inválida');
  });
});

describe('escapeIcsText', () => {
  it('escapa los caracteres reservados del estándar', () => {
    expect(escapeIcsText('Rock, pop; blues\\jazz')).toBe('Rock\\, pop\\; blues\\\\jazz');
  });

  it('convierte los saltos de línea en \\n literal', () => {
    expect(escapeIcsText('Línea 1\nLínea 2')).toBe('Línea 1\\nLínea 2');
    expect(escapeIcsText('Línea 1\r\nLínea 2')).toBe('Línea 1\\nLínea 2');
  });

  it('no toca texto sin caracteres especiales', () => {
    expect(escapeIcsText('Noche de rock')).toBe('Noche de rock');
  });
});

describe('composeEventDescription', () => {
  it('une las partes disponibles con guiones largos', () => {
    expect(composeEventDescription(['La Banda', 'Entradas en puerta'])).toBe(
      'La Banda — Entradas en puerta'
    );
  });

  it('descarta vacíos, null y undefined', () => {
    expect(composeEventDescription(['La Banda', null, '', undefined, '  Entradas  '])).toBe(
      'La Banda — Entradas'
    );
  });

  it('devuelve una cadena vacía si no hay datos', () => {
    expect(composeEventDescription([])).toBe('');
  });
});

describe('buildEventCalendar', () => {
  const ics = buildEventCalendar(event, { now });

  it('envuelve el evento en un calendario válido', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR')).toBe(true);
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('VERSION:2.0');
  });

  it('usa líneas separadas por CRLF', () => {
    expect(ics).toContain('\r\n');
    expect(ics.split('\r\n').length).toBeGreaterThan(10);
    expect(ics).not.toMatch(/[^\r]\n/);
  });

  it('arma UID y DTSTAMP con el identificador y el reloj inyectado', () => {
    expect(ics).toContain('UID:abc-123@lapulperia-mg');
    expect(ics).toContain('DTSTAMP:20261101T150000Z');
  });

  it('usa el inicio en UTC y suma tres horas de duración', () => {
    expect(ics).toContain('DTSTART:20261113T023000Z');
    expect(ics).toContain('DTEND:20261113T053000Z');
  });

  it('incluye título, ubicación, descripción y URL', () => {
    expect(ics).toContain('SUMMARY:Noche de rock');
    expect(ics).toContain('LOCATION:Av. Dardo Rocha 396\\, Monte Grande\\, Buenos Aires');
    expect(ics).toContain('DESCRIPTION:La Banda — Entradas en puerta');
    expect(ics).toContain(`URL:${event.url}`);
  });

  it('escapa los datos que vienen del panel', () => {
    const risky = buildEventCalendar(
      { ...event, title: 'Rock, pop; en vivo', description: 'Línea 1\nLínea 2' },
      { now }
    );
    expect(risky).toContain('SUMMARY:Rock\\, pop\\; en vivo');
    expect(risky).toContain('DESCRIPTION:Línea 1\\nLínea 2');
  });

  it('deja la descripción vacía si el evento no tiene datos extra', () => {
    const minimal = buildEventCalendar(
      {
        id: 'x',
        title: 'Solo título',
        start: event.start,
        url: 'https://x.test/x.ics',
        location: 'Acá',
      },
      { now }
    );
    expect(minimal).toContain('DESCRIPTION:\r\n');
  });

  it('lanza si el inicio es inválido', () => {
    expect(() => buildEventCalendar({ ...event, start: new Date('nope') }, { now })).toThrow(
      'Fecha inválida'
    );
  });
});
