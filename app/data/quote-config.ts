/**
 * Configuración central del cotizador.
 *
 * Todos los importes están expresados en pesos argentinos (ARS).
 * Para actualizar la cotización, modifica solamente los valores `pricePerGuest`
 * y `price` de este archivo. No hace falta tocar la lógica de la página.
 */

export type EventStyle = {
  id: string;
  title: string;
  duration: string;
  description: string;
  pricePerGuest: number;
  includes: string[];
};

export type Extra = {
  id: string;
  title: string;
  description: string;
  price: number;
  pricing: 'por persona' | 'por evento';
};

export const eventStyles: EventStyle[] = [
  {
    id: 'formal',
    title: 'Celebración formal',
    duration: '8 horas',
    description: 'Servicio completo para cenas, aniversarios y celebraciones formales.',
    pricePerGuest: 98000,
    includes: ['Planificación y coordinación', 'Catering personalizado', 'Ambientación base'],
  },
  {
    id: 'informal',
    title: 'Celebración informal',
    duration: '5 horas',
    description: 'Formato ágil para reuniones sociales y encuentros de día.',
    pricePerGuest: 72000,
    includes: ['Planificación y coordinación', 'Catering personalizado', 'Música y ambientación base'],
  },
  {
    id: 'casamiento',
    title: 'Casamiento',
    duration: '8 horas',
    description: 'Planificación y producción para una celebración de boda.',
    pricePerGuest: 125000,
    includes: ['Asesoramiento personalizado', 'Coordinación del evento', 'Ambientación base'],
  },
  {
    id: 'corporativo',
    title: 'Evento corporativo',
    duration: 'A medida',
    description: 'Producción para reuniones, lanzamientos y actividades de empresa.',
    pricePerGuest: 85000,
    includes: ['Coordinación', 'Espacios y montaje', 'Propuesta a medida'],
  },
];

export const extras: Extra[] = [
  { id: 'bar', title: 'Barra de tragos', description: 'Coctelería y servicio durante el evento.', price: 18000, pricing: 'por persona' },
  { id: 'photo', title: 'Fotografía y video', description: 'Cobertura fotográfica y audiovisual.', price: 350000, pricing: 'por evento' },
  { id: 'flowers', title: 'Ambientación floral', description: 'Diseño floral para mesas y espacios principales.', price: 480000, pricing: 'por evento' },
  { id: 'show', title: 'Show o DJ', description: 'Música y operación técnica durante el evento.', price: 420000, pricing: 'por evento' },
  { id: 'ceremony', title: 'Ceremonia', description: 'Montaje y producción para la ceremonia.', price: 280000, pricing: 'por evento' },
  { id: 'kids', title: 'Rincón infantil', description: 'Espacio y actividades para invitados menores.', price: 12000, pricing: 'por persona' },
];

export const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});
