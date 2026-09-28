import { asc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDb } from '../../../../db';
import { eventTypes, serviceAddons, users } from '../../../../db/schema';
import { getAdminSession } from '../../../../lib/session';

export const runtime = 'nodejs';
type EventInput = { id: string; title: string; description: string; pricePerGuest: number };
type CatalogUpdate = { events?: EventInput[]; extras?: Array<{ id: string; price: number }> };
const eventDetails = [{ heading: 'Bebidas', items: ['Bebidas sin alcohol incluidas.'] }];

function validEvent(event: Omit<EventInput, 'id'>) { return event.title.trim().length > 1 && event.title.length <= 120 && event.description.trim().length > 1 && event.description.length <= 2000 && Number.isInteger(event.pricePerGuest) && event.pricePerGuest >= 0; }
function slugify(title: string) { return `${title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${crypto.randomUUID().slice(0, 6)}`; }
async function authorized() {
  const session = await getAdminSession();
  if (!session) return false;
  const user = await getDb().query.users.findFirst({ where: eq(users.id, session.userId) });
  return Boolean(user?.active && user.role === 'admin');
}
function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    const publicHost = (request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? new URL(request.url).host).split(',')[0].trim();
    return originHost === publicHost;
  } catch { return false; }
}

export async function GET() {
  try {
    if (!(await authorized())) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    const db = getDb();
    const [events, extras] = await Promise.all([db.select().from(eventTypes).orderBy(asc(eventTypes.sortOrder)), db.select().from(serviceAddons).orderBy(asc(serviceAddons.sortOrder))]);
    return NextResponse.json({ events, extras });
  } catch { return NextResponse.json({ error: 'No se pudo obtener el catálogo.' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    if (!(await authorized()) || !sameOrigin(request)) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    const input = await request.json() as Omit<EventInput, 'id'>;
    if (!validEvent(input)) return NextResponse.json({ error: 'Revisa el título, la descripción y el precio.' }, { status: 400 });
    const db = getDb();
    const [event] = await db.insert(eventTypes).values({ slug: slugify(input.title), title: input.title.trim(), description: input.description.trim(), pricePerGuest: input.pricePerGuest, durationLabel: 'A definir', includedServices: ['Bebidas sin alcohol incluidas'], details: eventDetails, proposalPdf: '', sortOrder: 999 }).returning();
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo crear el evento.' }, { status: 400 }); }
}

export async function PATCH(request: Request) {
  try {
    if (!(await authorized()) || !sameOrigin(request)) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    const input = await request.json() as CatalogUpdate; const db = getDb();
    await db.transaction(async tx => {
      for (const event of input.events ?? []) { if (!validEvent(event)) throw new Error('Datos de evento inválidos.'); await tx.update(eventTypes).set({ title: event.title.trim(), description: event.description.trim(), pricePerGuest: event.pricePerGuest, updatedAt: new Date() }).where(eq(eventTypes.id, event.id)); }
      for (const extra of input.extras ?? []) { if (!Number.isInteger(extra.price) || extra.price < 0) throw new Error('Precio de servicio inválido.'); await tx.update(serviceAddons).set({ price: extra.price, updatedAt: new Date() }).where(eq(serviceAddons.id, extra.id)); }
    });
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudieron guardar los cambios.' }, { status: 400 }); }
}

export async function DELETE(request: Request) {
  try {
    if (!(await authorized()) || !sameOrigin(request)) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    const { id } = await request.json() as { id?: string };
    if (!id) return NextResponse.json({ error: 'Evento inválido.' }, { status: 400 });
    const db = getDb(); await db.delete(eventTypes).where(eq(eventTypes.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo eliminar el evento.' }, { status: 400 }); }
}
