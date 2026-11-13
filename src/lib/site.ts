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
    country: 'AR',
  },
  geo: {
    lat: -34.817963,
    lng: -58.476534,
  },
  whatsapp: {
    label: '11 5902 5308',
    number: '5491159025308',
    message: 'Hola! Quería hacer un pedido de delivery.',
  },
  social: {
    // Completar cuando esté el handle, ej: 'https://instagram.com/lapulperiamg'
    instagram: null as string | null,
  },
} as const;

export const WHATSAPP_URL = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(
  SITE.whatsapp.message
)}`;

export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${SITE.geo.lat},${SITE.geo.lng}`;

export const ADDRESS_LINE = `${SITE.address.street}, ${SITE.address.locality}`;
