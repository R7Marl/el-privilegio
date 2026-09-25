import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'El Privilegio | Organización de eventos',
  description: 'Vos solo disfrutá. Creamos eventos a tu medida: casamientos, cumpleaños, eventos privados y corporativos. Consultá tu presupuesto por WhatsApp.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-AR"><body>{children}</body></html>;
}
