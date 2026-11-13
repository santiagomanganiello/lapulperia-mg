import type { APIRoute } from 'astro';
import { buildEventCalendar, composeEventDescription } from '../../lib/calendar';
import { LOCATION_LINE } from '../../lib/site';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

export const prerender = false;

type EventRow = {
  id: string;
  title: string;
  artist: string | null;
  description: string | null;
  event_date: string;
  ticket_info: string | null;
};

export const GET: APIRoute = async ({ params, url }) => {
  const id = params.id;

  if (!id) return new Response('Evento no encontrado', { status: 404 });
  if (!isSupabaseConfigured) return new Response('Agenda no disponible', { status: 503 });

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

  const body = buildEventCalendar({
    id: event.id,
    title: event.title,
    start,
    url: new URL(`/eventos/${event.id}.ics`, url).href,
    location: LOCATION_LINE,
    description: composeEventDescription([event.artist, event.description, event.ticket_info]),
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="evento-${event.id}.ics"`,
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
};
