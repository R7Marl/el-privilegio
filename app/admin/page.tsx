'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, CircleDollarSign, ClipboardList, Eye, LockKeyhole, LogOut, Menu, Plus, Save, Settings2, Trash2, Users, X } from 'lucide-react';
import { currency, eventStyles as defaultEvents, extras as defaultExtras, type EventStyle, type Extra } from '../data/quote-config';
import styles from './admin.module.css';

const DEMO_USER = 'admin@elprivilegio.demo';
const DEMO_PASSWORD = 'demo1234';
const STORAGE_KEY = 'el-privilegio-admin-demo-prices';

type PriceData = { events: EventStyle[]; extras: Extra[] };

const defaultData: PriceData = {
  events: defaultEvents.map(item => ({ ...item, includes: [...item.includes] })),
  extras: defaultExtras.map(item => ({ ...item })),
};
const newEvent = (): EventStyle => ({ id: `local-${Date.now()}`, title: 'Nuevo servicio', description: 'Describe lo que incluye este servicio.', duration: 'A definir', pricePerGuest: 0, includes: ['Bebidas sin alcohol incluidas'], details: [{ heading: 'Bebidas', items: ['Bebidas sin alcohol incluidas.'] }], proposalPdf: '' });

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [data, setData] = useState<PriceData>(defaultData);
  const [saved, setSaved] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [databaseMode, setDatabaseMode] = useState(false);

  useEffect(() => {
    const demoSession = sessionStorage.getItem('el-privilegio-admin-demo') === 'true';
    setAuthenticated(demoSession);
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try { setData(JSON.parse(savedData) as PriceData); } catch { localStorage.removeItem(STORAGE_KEY); }
    }
  }, []);

  useEffect(() => {
    if (!authenticated || !databaseMode) return;
    fetch('/api/catalog').then(response => response.ok ? response.json() : null).then(catalog => {
      if (!catalog) return;
      setData({
        events: catalog.events.map((item: { id: string; title: string; durationLabel: string; description: string; pricePerGuest: number; includedServices: string[]; details?: EventStyle['details']; proposalPdf?: string }) => ({ id: item.id, title: item.title, duration: item.durationLabel, description: item.description, pricePerGuest: item.pricePerGuest, includes: item.includedServices, details: item.details ?? [], proposalPdf: item.proposalPdf ?? '' })),
        extras: catalog.extras.map((item: { id: string; title: string; description: string; price: number; pricing: 'per_person' | 'per_event' }) => ({ id: item.id, title: item.title, description: item.description, price: item.price, pricing: item.pricing === 'per_person' ? 'por persona' : 'por evento' })),
      });
    }).catch(() => setDatabaseMode(false));
  }, [authenticated, databaseMode]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }).catch(() => null);
    if (response?.ok) {
      setDatabaseMode(true);
      setAuthenticated(true);
      setError('');
      return;
    }
    if (email.trim().toLowerCase() !== DEMO_USER || password !== DEMO_PASSWORD) return setError('Las credenciales no coinciden.');
    sessionStorage.setItem('el-privilegio-admin-demo', 'true');
    setAuthenticated(true);
    setError('');
  }

  function updateEvent(id: string, changes: Partial<Pick<EventStyle, 'title' | 'description' | 'pricePerGuest'>>) {
    setSaved(false);
    setData(current => ({ ...current, events: current.events.map(item => item.id === id ? { ...item, ...changes } : item) }));
  }

  function updateExtra(id: string, price: number) {
    setSaved(false);
    setData(current => ({ ...current, extras: current.extras.map(item => item.id === id ? { ...item, price } : item) }));
  }

  async function save() {
    if (databaseMode) {
      const localEvents = data.events.filter(item => item.id.startsWith('local-'));
      const existingEvents = data.events.filter(item => !item.id.startsWith('local-'));
      for (const event of localEvents) {
        const response = await fetch('/api/admin/catalog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: event.title, description: event.description, pricePerGuest: event.pricePerGuest }) });
        if (!response.ok) { setSaved(false); return; }
        const created = await response.json() as { event: { id: string } };
        setData(current => ({ ...current, events: current.events.map(item => item.id === event.id ? { ...item, id: created.event.id } : item) }));
      }
      const response = await fetch('/api/admin/catalog', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ events: existingEvents.map(item => ({ id: item.id, title: item.title, description: item.description, pricePerGuest: item.pricePerGuest })), extras: data.extras.map(item => ({ id: item.id, price: item.price })) }) });
      if (!response.ok) { setSaved(false); return; }
      setSaved(true);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSaved(true);
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setData(defaultData);
    setSaved(false);
  }
  async function addEvent() { setSaved(false); setData(current => ({ ...current, events: [...current.events, newEvent()] })); }
  async function removeEvent(id: string) {
    if (!window.confirm('¿Eliminar este evento? Esta acción no se puede deshacer.')) return;
    if (databaseMode && !id.startsWith('local-')) { const response = await fetch('/api/admin/catalog', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); if (!response.ok) return; }
    setData(current => ({ ...current, events: current.events.filter(item => item.id !== id) })); setSaved(false);
  }

  async function logout() {
    if (databaseMode) await fetch('/api/admin/auth', { method: 'DELETE' });
    sessionStorage.removeItem('el-privilegio-admin-demo');
    setAuthenticated(false);
    setDatabaseMode(false);
    setMenuOpen(false);
  }

  if (!authenticated) return <Login email={email} password={password} error={error} onEmail={setEmail} onPassword={setPassword} onSubmit={login} />;

  return <main className={styles.adminShell}>
    <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}>
      <div className={styles.sidebarBrand}><span>EP</span><div><strong>EL PRIVILEGIO</strong><small>ADMINISTRACIÓN</small></div><button className={styles.closeMenu} onClick={() => setMenuOpen(false)} aria-label="Cerrar menú"><X size={19} /></button></div>
      <nav aria-label="Administración"><a className={styles.active}><ClipboardList size={18} /> Resumen</a><a className={styles.active}><CircleDollarSign size={18} /> Precios</a><a><Users size={18} /> Eventos <span>Próximamente</span></a><a><Settings2 size={18} /> Configuración <span>Próximamente</span></a></nav>
      <div className={styles.sidebarBottom}><a href="/" target="_blank" rel="noopener noreferrer"><Eye size={17} /> Ver sitio público</a><button onClick={logout}><LogOut size={17} /> Cerrar sesión</button></div>
    </aside>
    <div className={styles.content}>
      <header className={styles.topbar}><button className={styles.menuButton} onClick={() => setMenuOpen(true)} aria-label="Abrir menú"><Menu size={21} /></button><div><p>Administración</p><h1>Precios y servicios</h1></div><button className={styles.saveTop} onClick={save}><Save size={16} /> Guardar cambios</button></header>
      <section className={styles.notice}><LockKeyhole size={18} /><div><strong>{databaseMode ? 'Base de datos conectada' : 'Entorno de demostración'}</strong><p>{databaseMode ? 'Los precios se guardarán en PostgreSQL y estarán disponibles para el cotizador.' : 'Los cambios se guardan solamente en este navegador. Configura PostgreSQL para publicarlos.'}</p></div></section>
      <section className={styles.metrics} aria-label="Resumen de precios"><article><span>Tipos de evento</span><strong>{data.events.length}</strong><small>con precio por persona</small></article><article><span>Servicios adicionales</span><strong>{data.extras.length}</strong><small>con precio configurable</small></article><article><span>Moneda</span><strong>ARS</strong><small>pesos argentinos</small></article></section>
      <section className={styles.pageIntro}><div><p className={styles.eyebrow}>COTIZADOR</p><h2>Precios de eventos</h2><p>Estos valores se usarán como referencia para calcular el total de cada cotización.</p></div><div className={styles.eventActions}><button className={styles.addButton} onClick={addEvent}><Plus size={16} /> Crear evento</button><button className={styles.resetButton} onClick={reset}>Restaurar valores iniciales</button></div></section>
      <section className={styles.panel}><div className={styles.panelHead}><div><h3>Tipos de evento</h3><p>Edita los datos y guarda los cambios para publicar el catálogo.</p></div><span>{data.events.length} opciones</span></div><div className={styles.table}><div className={`${styles.tableRow} ${styles.eventLabels} ${styles.tableLabels}`}><span>Evento y descripción</span><span>Precio por persona</span><span>Acciones</span></div>{data.events.map(event => <div className={`${styles.tableRow} ${styles.eventRow}`} key={event.id}><div className={styles.eventFields}><input aria-label="Título del evento" value={event.title} onChange={input => updateEvent(event.id, { title: input.target.value })} /><textarea aria-label={`Descripción para ${event.title}`} value={event.description} onChange={input => updateEvent(event.id, { description: input.target.value })} /></div><label><span className={styles.currencyPrefix}>$</span><input aria-label={`Precio por persona para ${event.title}`} type="number" min="0" step="1000" value={event.pricePerGuest} onChange={input => updateEvent(event.id, { pricePerGuest: Math.max(0, Number(input.target.value) || 0) })} /><small>{currency.format(event.pricePerGuest)} por persona</small></label><button className={styles.deleteButton} onClick={() => removeEvent(event.id)} aria-label={`Eliminar ${event.title}`}><Trash2 size={16} /> Eliminar</button></div>)}</div></section>
      <section className={styles.panel}><div className={styles.panelHead}><div><h3>Servicios adicionales</h3><p>Importes que el cliente puede añadir a su cotización.</p></div><span>{data.extras.length} servicios</span></div><div className={styles.table}><div className={`${styles.tableRow} ${styles.tableLabels}`}><span>Servicio</span><span>Modalidad</span><span>Precio</span></div>{data.extras.map(extra => <div className={styles.tableRow} key={extra.id}><div><strong>{extra.title}</strong><small>{extra.description}</small></div><span>{extra.pricing}</span><label><span className={styles.currencyPrefix}>$</span><input aria-label={`Precio para ${extra.title}`} type="number" min="0" step="1000" value={extra.price} onChange={input => updateExtra(extra.id, Math.max(0, Number(input.target.value) || 0))} /><small>{currency.format(extra.price)}</small></label></div>)}</div></section>
      <div className={styles.saveBar}><div>{saved ? <><Check size={18} /> {databaseMode ? 'Cambios guardados en PostgreSQL.' : 'Cambios guardados en este navegador.'}</> : <>{databaseMode ? 'Realiza los cambios y guárdalos para actualizar el cotizador.' : 'Realiza los cambios y guárdalos para conservarlos en este navegador.'}</>}</div><button onClick={save}><Save size={17} /> Guardar cambios</button></div>
    </div>
  </main>;
}

function Login({ email, password, error, onEmail, onPassword, onSubmit }: { email: string; password: string; error: string; onEmail: (value: string) => void; onPassword: (value: string) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void> }) {
  return <main className={styles.loginPage}><a className={styles.backLink} href="/"><ArrowLeft size={16} /> Volver al sitio</a><section className={styles.loginCard}><div className={styles.loginBrand}><span>EP</span><p>EL PRIVILEGIO<small>ORGANIZACIÓN DE EVENTOS</small></p></div><p className={styles.eyebrow}>PANEL DE ADMINISTRACIÓN</p><h1>Acceso de demostración</h1><p className={styles.loginDescription}>Esta sección es una plantilla local. No utiliza una base de datos ni está pensada para producción.</p><form onSubmit={onSubmit}><label>Usuario<input value={email} onChange={event => onEmail(event.target.value)} type="email" autoComplete="username" placeholder="usuario@ejemplo.com" required /></label><label>Contraseña<input value={password} onChange={event => onPassword(event.target.value)} type="password" autoComplete="current-password" placeholder="••••••••" required /></label>{error && <p className={styles.loginError}>{error}</p>}<button type="submit">Ingresar <ChevronRight size={18} /></button></form><div className={styles.demoCredentials}><strong>Credenciales de ejemplo</strong><span>Usuario: <b>{DEMO_USER}</b></span><span>Contraseña: <b>{DEMO_PASSWORD}</b></span></div></section></main>;
}
