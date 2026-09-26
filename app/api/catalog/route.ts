import { asc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDb } from '../../../db';
import { eventTypes, serviceAddons } from '../../../db/schema';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const db = getDb();
    const [events, extras] = await Promise.all([
      db.select().from(eventTypes).where(eq(eventTypes.active, true)).orderBy(asc(eventTypes.sortOrder)),
      db.select().from(serviceAddons).where(eq(serviceAddons.active, true)).orderBy(asc(serviceAddons.sortOrder)),
    ]);
    return NextResponse.json({ events, extras });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo obtener el catálogo.' }, { status: 503 });
  }
}
