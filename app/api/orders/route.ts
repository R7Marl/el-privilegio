import { eq, inArray } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getDb } from '../../../db';
import { eventTypes, orderItems, orders, serviceAddons } from '../../../db/schema';

export const runtime = 'nodejs';
type OrderRequest = { customerName: string; customerEmail: string; customerPhone: string; eventDate?: string; adultCount: number; childCount: number; eventTypeSlug: string; addonSlugs?: string[]; paymentMethod: 'transfer' | 'card' };

export async function POST(request: Request) {
  try {
    const input = await request.json() as OrderRequest;
    if (!input.customerName?.trim() || !/^\S+@\S+\.\S+$/.test(input.customerEmail ?? '') || input.customerPhone?.trim().length < 6 || !Number.isInteger(input.adultCount) || input.adultCount < 1 || !Number.isInteger(input.childCount) || input.childCount < 0 || !input.eventTypeSlug || !['transfer', 'card'].includes(input.paymentMethod)) return NextResponse.json({ error: 'Revisa los datos de la reserva.' }, { status: 400 });
    const db = getDb(); const event = await db.query.eventTypes.findFirst({ where: eq(eventTypes.slug, input.eventTypeSlug) });
    if (!event || !event.active) return NextResponse.json({ error: 'Servicio no disponible.' }, { status: 404 });
    const addons = input.addonSlugs?.length ? await db.select().from(serviceAddons).where(inArray(serviceAddons.slug, input.addonSlugs)) : [];
    const attendeeCount = input.adultCount + input.childCount; const subtotal = event.pricePerGuest * attendeeCount;
    const items = addons.map(addon => { const quantity = addon.pricing === 'per_person' ? attendeeCount : addon.pricing === 'per_table' ? Math.ceil(attendeeCount / 8) : addon.pricing === 'per_8_children' ? Math.ceil(input.childCount / 8) : 1; return { serviceAddonId: addon.id, title: addon.title, quantity, unitPrice: addon.price, total: addon.price * quantity }; });
    const total = subtotal + items.reduce((sum, item) => sum + item.total, 0); const depositAmount = Math.round(total * 0.3); const reference = `EP-${new Date().getFullYear()}-${randomUUID().slice(0, 6).toUpperCase()}`;
    const [order] = await db.insert(orders).values({ reference, customerName: input.customerName.trim(), customerEmail: input.customerEmail.trim().toLowerCase(), customerPhone: input.customerPhone.trim(), eventDate: input.eventDate ? new Date(`${input.eventDate}T12:00:00`) : undefined, guestCount: input.adultCount, childCount: input.childCount, eventTypeId: event.id, subtotal, total, depositAmount, paymentMethod: input.paymentMethod, status: 'deposit_pending' }).returning();
    if (items.length) await db.insert(orderItems).values(items.map(item => ({ ...item, orderId: order.id })));
    return NextResponse.json({ reference, depositAmount, paymentMethod: input.paymentMethod }, { status: 201 });
  } catch { return NextResponse.json({ error: 'No se pudo registrar la reserva.' }, { status: 500 }); }
}
