import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDb } from '../../../../db';
import { users } from '../../../../db/schema';
import { verifyPassword } from '../../../../lib/password';
import { createSessionToken, expiredSessionCookie, sessionCookie } from '../../../../lib/session';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
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
