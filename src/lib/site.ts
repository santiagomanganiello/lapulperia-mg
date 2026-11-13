/**
 * Datos centralizados del lugar.
 * Cambiar acá se refleja en home, footer, ubicación, JSON-LD y metadata.
 */
export const SITE = {
  name: 'La Pulpería MG',
  tagline: 'Bar · Música en vivo · Eventos',
  description:
    'Bar en Monte Grande. Música en vivo, eventos y delivery. Mirá la agenda, la carta y pedí por WhatsApp.',
  address: {
    street: 'Av. Dardo Rocha 396',
    locality: 'Monte Grande',
    region: 'Buenos Aires',
    postalCode: 'B1842ABH',
    country: 'AR',
  },
  // Coordenadas verificadas contra el nodo de OSM del bar y el geocoder de ArcGIS
  // para Av. Dardo Rocha 396. No usar el centro del iframe de Google como referencia.
  geo: {
    lat: -34.817899,
    lng: -58.473892,
  },
  whatsapp: {
    label: '11 5902 5308',
    number: '5491159025308',
    message: 'Hola! Quería hacer un pedido de delivery.',
  },
  social: {
    instagram: 'https://www.instagram.com/lapulperiamg/',
  },
} as const;

export const WHATSAPP_URL = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(
  SITE.whatsapp.message
)}`;

/** Dirección completa para búsquedas y navegación. */
export const ADDRESS_QUERY = `${SITE.address.street}, ${SITE.address.locality}, ${SITE.address.region}, Argentina`;

// Links por dirección (no por coordenadas): si el pin de Google se mueve, siguen siendo correctos.
export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS_QUERY)}`;

export const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  ADDRESS_QUERY
)}`;

export const ADDRESS_LINE = `${SITE.address.street}, ${SITE.address.locality}`;
