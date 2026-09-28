import { Building2, MapPin, Trees } from 'lucide-react';

const places = [
  { icon: Building2, title: 'Salones', text: 'Opciones para eventos de distintas escalas y estilos.' },
  { icon: Trees, title: 'Quintas y espacios al aire libre', text: 'Propuestas para celebraciones de día, tarde o noche.' },
  { icon: MapPin, title: 'Tu espacio', text: 'Coordinamos el servicio en el lugar que elijas.' },
];

export function TrustedPlaces() {
  return <section className="trusted-places section" id="lugares"><div className="container"><div className="places-heading"><div><p className="eyebrow">LUGARES DE CONFIANZA</p><h2>El lugar también<br />forma parte del <em>evento.</em></h2></div><p>Trabajamos en Ciudad de Buenos Aires y nos trasladamos a cualquier punto del interior del país.</p></div><div className="places-grid">{places.map(({ icon: Icon, title, text }) => <article key={title}><Icon size={31} strokeWidth={1.2} /><h3>{title}</h3><p>{text}</p></article>)}</div><p className="places-note">Si todavía no tienes lugar, cuéntanos qué tipo de evento estás organizando y te ayudamos a encontrar una opción adecuada.</p></div></section>;
}
