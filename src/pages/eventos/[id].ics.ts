import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { SITE } from '../../lib/site';

export const prerender = false;

type EventRow = {
  id: string;
  title: string;
  artist: string | null;
  description: string | null;
  event_date: string;
  ticket_info: string | null;
};

function toIcsDate(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

function escapeText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

export const GET: APIRoute = async ({ params, url }) => {
  const id = params.id;

  if (!id) return new Response('Evento no encontrado', { status: 404 });

  const { data } = await supabase
    .from('events')
    .select('id, title, artist, description, event_date, ticket_info')
    .eq('id', id)
    .eq('published', true)
    .maybeSingle();

  const event = data as EventRow | null;
  if (!event) return new Response('Evento no encontrado', { status: 404 });

  const start = new Date(event.event_date);
  if (Number.isNaN(start.getTime())) return new Response('Fecha inválida', { status: 500 });

  // El modelo no guarda duración: se asume una noche típica.
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);

  const location = `${SITE.address.street}, ${SITE.address.locality}, ${SITE.address.region}`;
  const description = [event.artist, event.description, event.ticket_info]
    .filter(Boolean)
    .join(' — ');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//La Pulperia MG//Eventos//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@lapulperia-mg`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `LOCATION:${escapeText(location)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${new URL(`/eventos/${event.id}.ics`, url).href}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return new Response(lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="evento-${event.id}.ics"`,
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
};
