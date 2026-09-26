import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDb } from '../../../../db';
import { users } from '../../../../db/schema';
import { verifyPassword } from '../../../../lib/password';
import { createSessionToken, expiredSessionCookie, getAdminSession, sessionCookie } from '../../../../lib/session';

export const runtime = 'nodejs';

const attempts = new Map<string, { count: number; resetAt: number }>();
function canAttempt(request: Request) {
  const key = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'; const now = Date.now(); const current = attempts.get(key);
  if (!current || current.resetAt < now) { attempts.set(key, { count: 1, resetAt: now + 15 * 60_000 }); return true; }
  if (current.count >= 8) return false; current.count += 1; return true;
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    const db = getDb(); const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
    if (!user?.active) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch { return NextResponse.json({ error: 'No se pudo validar la sesión.' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    if (!canAttempt(request)) return NextResponse.json({ error: 'Demasiados intentos. Inténtalo más tarde.' }, { status: 429 });
    const { email, password } = await request.json() as { email?: string; password?: string };
    if (!email || !password) return NextResponse.json({ error: 'Usuario y contraseña requeridos.' }, { status: 400 });
    const db = getDb();
    const user = await db.query.users.findFirst({ where: eq(users.email, email.trim().toLowerCase()) });
    if (!user || !user.active || !(await verifyPassword(password, user.passwordHash))) return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });
    const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    const cookie = sessionCookie(createSessionToken(user.id));
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo iniciar sesión.' }, { status: 500 });
  }
}

export function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(expiredSessionCookie.name, expiredSessionCookie.value, expiredSessionCookie.options);
  return response;
}
