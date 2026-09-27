import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDb } from '../../../../db';
import { eventTypes, orders, users } from '../../../../db/schema';
import { getAdminSession } from '../../../../lib/session';

export const runtime = 'nodejs';
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  const db = getDb(); const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!user?.active || user.role !== 'admin') return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  const rows = await db.select({ id: orders.id, reference: orders.reference, customerName: orders.customerName, customerEmail: orders.customerEmail, customerPhone: orders.customerPhone, guestCount: orders.guestCount, childCount: orders.childCount, total: orders.total, depositAmount: orders.depositAmount, paymentMethod: orders.paymentMethod, status: orders.status, createdAt: orders.createdAt, eventTitle: eventTypes.title }).from(orders).leftJoin(eventTypes, eq(orders.eventTypeId, eventTypes.id)).orderBy(desc(orders.createdAt)).limit(100);
  return NextResponse.json({ orders: rows });
}
