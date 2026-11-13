import { describe, expect, it } from 'vitest';
import {
  SCHEDULE,
  describeStatus,
  formatTime,
  getStatus,
  nowInZone,
  type OpenStatus,
} from '../src/lib/hours';

/**
 * Argentina no tiene horario de verano: -03:00 todo el año.
 * Fechas con offset explícito para que los tests no dependan del TZ de la máquina.
 */
const at = (iso: string) => new Date(iso);

describe('formatTime', () => {
  it('formatea minutos dentro del día', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(90)).toBe('01:30');
    expect(formatTime(17 * 60)).toBe('17:00');
  });

  it('normaliza horas que cruzan medianoche', () => {
    expect(formatTime(1440)).toBe('00:00');
    expect(formatTime(1560)).toBe('02:00');
    expect(formatTime(27 * 60)).toBe('03:00');
  });

  it('normaliza valores negativos', () => {
    expect(formatTime(-60)).toBe('23:00');
  });
});

describe('nowInZone', () => {
  it('devuelve el día y los minutos en horario de Argentina', () => {
    expect(nowInZone(at('2026-11-12T01:30:00-03:00'))).toEqual({ weekday: 4, minutes: 90 });
  });

  it('funciona en el último minuto del día', () => {
    expect(nowInZone(at('2026-11-15T23:59:00-03:00'))).toEqual({
      weekday: 0,
      minutes: 23 * 60 + 59,
    });
  });
});

describe('getStatus', () => {
  it('abre el miércoles a las 17:00 en punto', () => {
    expect(getStatus(at('2026-11-11T17:00:00-03:00'))).toEqual({
      open: true,
      closesAt: '02:00',
      fromYesterday: false,
    });
  });

  it('sigue abierto el miércoles a las 23:59', () => {
    expect(getStatus(at('2026-11-11T23:59:00-03:00'))).toMatchObject({
      open: true,
      closesAt: '02:00',
    });
  });

  it('el jueves a la 01:00 sigue abierto por el turno del miércoles', () => {
    expect(getStatus(at('2026-11-12T01:00:00-03:00'))).toEqual({
      open: true,
      closesAt: '02:00',
      fromYesterday: true,
    });
  });

  it('el jueves a las 02:00 ya cerró y abre al mediodía', () => {
    expect(getStatus(at('2026-11-12T02:00:00-03:00'))).toEqual({
      open: false,
      opensAt: '12:00',
      inDays: 0,
      weekday: 4,
    });
  });

  it('el jueves a las 11:59 todavía está cerrado', () => {
    expect(getStatus(at('2026-11-12T11:59:00-03:00'))).toMatchObject({
      open: false,
      opensAt: '12:00',
      inDays: 0,
    });
  });

  it('el jueves a las 12:00 abre y cierra a las 03:00', () => {
    expect(getStatus(at('2026-11-12T12:00:00-03:00'))).toEqual({
      open: true,
      closesAt: '03:00',
      fromYesterday: false,
    });
  });

  it('el viernes a las 02:59 sigue abierto por el turno del jueves', () => {
    expect(getStatus(at('2026-11-13T02:59:00-03:00'))).toEqual({
      open: true,
      closesAt: '03:00',
      fromYesterday: true,
    });
  });

  it('el viernes a las 03:00 cierra y reabre al mediodía', () => {
    expect(getStatus(at('2026-11-13T03:00:00-03:00'))).toMatchObject({
      open: false,
      opensAt: '12:00',
      inDays: 0,
    });
  });

  it('el sábado a la 01:00 sigue abierto por el turno del viernes', () => {
    expect(getStatus(at('2026-11-14T01:00:00-03:00'))).toMatchObject({
      open: true,
      closesAt: '03:00',
      fromYesterday: true,
    });
  });

  it('el domingo a la 01:00 sigue abierto por el turno del sábado', () => {
    expect(getStatus(at('2026-11-15T01:00:00-03:00'))).toMatchObject({
      open: true,
      closesAt: '03:00',
      fromYesterday: true,
    });
  });

  it('el domingo a las 16:59 está cerrado y abre a las 17:00', () => {
    expect(getStatus(at('2026-11-15T16:59:00-03:00'))).toEqual({
      open: false,
      opensAt: '17:00',
      inDays: 0,
      weekday: 0,
    });
  });

  it('el lunes a la 01:00 sigue abierto por el turno del domingo', () => {
    expect(getStatus(at('2026-11-16T01:00:00-03:00'))).toMatchObject({
      open: true,
      closesAt: '02:00',
      fromYesterday: true,
    });
  });

  it('el lunes a las 02:00 cierra hasta el miércoles', () => {
    expect(getStatus(at('2026-11-16T02:00:00-03:00'))).toEqual({
      open: false,
      opensAt: '17:00',
      inDays: 2,
      weekday: 3,
    });
  });

  it('el martes a las 23:00 abre mañana', () => {
    expect(getStatus(at('2026-11-17T23:00:00-03:00'))).toEqual({
      open: false,
      opensAt: '17:00',
      inDays: 1,
      weekday: 3,
    });
  });
});

describe('describeStatus', () => {
  it('describe un local abierto', () => {
    const status: OpenStatus = { open: true, closesAt: '02:00', fromYesterday: false };
    expect(describeStatus(status)).toBe('Abierto ahora · cierra 02:00');
  });

  it('describe una apertura hoy', () => {
    expect(describeStatus({ open: false, opensAt: '12:00', inDays: 0, weekday: 4 })).toBe(
      'Cerrado · abre hoy 12:00'
    );
  });

  it('describe una apertura mañana', () => {
    expect(describeStatus({ open: false, opensAt: '17:00', inDays: 1, weekday: 3 })).toBe(
      'Cerrado · abre mañana 17:00'
    );
  });

  it('nombra el día cuando falta más de uno', () => {
    expect(describeStatus({ open: false, opensAt: '17:00', inDays: 2, weekday: 3 })).toBe(
      'Cerrado · abre el miércoles 17:00'
    );
  });

  it('cae en "Cerrado" sin próximo turno', () => {
    expect(describeStatus({ open: false, opensAt: null, inDays: null, weekday: null })).toBe(
      'Cerrado'
    );
  });
});

describe('SCHEDULE', () => {
  it('tiene los siete días y cierra lunes y martes', () => {
    expect(Object.keys(SCHEDULE)).toHaveLength(7);
    expect(SCHEDULE[1]).toEqual([]);
    expect(SCHEDULE[2]).toEqual([]);
  });

  it('todos los turnos abiertos cruzan medianoche', () => {
    const shifts = Object.values(SCHEDULE).flat();
    expect(shifts.length).toBeGreaterThan(0);
    for (const shift of shifts) {
      expect(shift.close).toBeGreaterThan(1440);
    }
  });
});
