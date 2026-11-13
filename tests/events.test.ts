import { describe, expect, it } from 'vitest';
import { formatEventDate, relativeDayLabel } from '../src/lib/events';

describe('formatEventDate', () => {
  it('formatea en español con la fecha capitalizada y la hora en hs', () => {
    expect(formatEventDate('2026-11-12T21:00:00-03:00')).toEqual({
      fecha: 'Jueves, 12 de noviembre de 2026',
      hora: '21:00 hs',
    });
  });

  it('no adelanta el día en eventos de las 23:30', () => {
    expect(formatEventDate('2026-11-12T23:30:00-03:00')).toEqual({
      fecha: 'Jueves, 12 de noviembre de 2026',
      hora: '23:30 hs',
    });
  });

  it('usa horario de Argentina aunque el ISO venga en UTC', () => {
    // 2026-11-13T00:30Z = 2026-11-12 21:30 en Argentina.
    expect(formatEventDate('2026-11-13T00:30:00Z')).toEqual({
      fecha: 'Jueves, 12 de noviembre de 2026',
      hora: '21:30 hs',
    });
  });

  it('devuelve la entrada sin hora si la fecha es inválida', () => {
    expect(formatEventDate('no-es-una-fecha')).toEqual({
      fecha: 'no-es-una-fecha',
      hora: '',
    });
  });
});

describe('relativeDayLabel', () => {
  // Jueves 12 de noviembre de 2026, 10:00 en Argentina.
  const now = new Date('2026-11-12T10:00:00-03:00');

  it('marca el mismo día calendario como "Hoy"', () => {
    expect(relativeDayLabel('2026-11-12T23:30:00-03:00', now)).toBe('Hoy');
  });

  it('marca el día siguiente como "Mañana"', () => {
    expect(relativeDayLabel('2026-11-13T00:05:00-03:00', now)).toBe('Mañana');
  });

  it('cuenta los días hasta la semana', () => {
    expect(relativeDayLabel('2026-11-15T21:00:00-03:00', now)).toBe('En 3 días');
    expect(relativeDayLabel('2026-11-18T21:00:00-03:00', now)).toBe('En 6 días');
  });

  it('no etiqueta eventos de la semana siguiente', () => {
    expect(relativeDayLabel('2026-11-19T21:00:00-03:00', now)).toBeNull();
  });

  it('no etiqueta eventos pasados', () => {
    expect(relativeDayLabel('2026-11-11T21:00:00-03:00', now)).toBeNull();
  });

  it('compara días calendario, no horas', () => {
    // A las 23:59 del jueves, un evento a las 00:01 del viernes es "Mañana".
    const lateNight = new Date('2026-11-12T23:59:00-03:00');
    expect(relativeDayLabel('2026-11-13T00:01:00-03:00', lateNight)).toBe('Mañana');
  });

  it('resuelve "Hoy" aunque en UTC ya sea el día siguiente', () => {
    // 23:00 del 12 en Argentina = 02:00Z del 13.
    const lateNight = new Date('2026-11-12T23:00:00-03:00');
    expect(relativeDayLabel('2026-11-12T23:30:00-03:00', lateNight)).toBe('Hoy');
  });

  it('devuelve null con una fecha inválida', () => {
    expect(relativeDayLabel('cualquier cosa', now)).toBeNull();
  });
});
