import { eq, inArray } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getDb } from '../../../db';
import { eventTypes, orderItems, orders, serviceAddons } from '../../../db/schema';

export const runtime = 'nodejs';

type OrderRequest = { customerName?: string; customerEmail?: string; customerPhone?: string; eventDate?: string; guestCount: number; childCount?: number; eventTypeId: string; addonIds?: string[]; notes?: string };

export async function POST(request: Request) {
  try {
    const input = await request.json() as OrderRequest;
    if (!Number.isInteger(input.guestCount) || input.guestCount < 1 || !input.eventTypeId) return NextResponse.json({ error: 'Datos de cotización inválidos.' }, { status: 400 });
    const db = getDb();
    const event = await db.query.eventTypes.findFirst({ where: eq(eventTypes.id, input.eventTypeId) });
    if (!event || !event.active) return NextResponse.json({ error: 'Tipo de evento no disponible.' }, { status: 404 });
    const addons = input.addonIds?.length ? await db.select().from(serviceAddons).where(inArray(serviceAddons.id, input.addonIds)) : [];
    const subtotal = event.pricePerGuest * input.guestCount;
    const items = addons.map(addon => {
      const quantity = addon.pricing === 'per_person' ? input.guestCount : addon.pricing === 'per_table' ? Math.ceil(input.guestCount / 8) : addon.pricing === 'per_8_children' ? Math.ceil((input.childCount ?? 0) / 8) : 1;
      return { serviceAddonId: addon.id, title: addon.title, quantity, unitPrice: addon.price, total: addon.price * quantity };
    });
    const total = subtotal + items.reduce((sum, item) => sum + item.total, 0);
    const reference = `EP-${new Date().getFullYear()}-${randomUUID().slice(0, 6).toUpperCase()}`;
    const [order] = await db.insert(orders).values({ reference, customerName: input.customerName, customerEmail: input.customerEmail, customerPhone: input.customerPhone, eventDate: input.eventDate ? new Date(`${input.eventDate}T12:00:00`) : undefined, guestCount: input.guestCount, eventTypeId: event.id, subtotal, total, notes: input.notes, status: 'draft' }).returning();
    if (items.length) await db.insert(orderItems).values(items.map(item => ({ ...item, orderId: order.id })));
    return NextResponse.json({ id: order.id, reference, subtotal, total }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo crear la orden.' }, { status: 500 });
  }
}
