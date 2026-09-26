import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'el_privilegio_admin';
const MAX_AGE = 60 * 60 * 8;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error('ADMIN_SESSION_SECRET no está configurado.');
  return value;
}

function sign(value: string) { return createHmac('sha256', secret()).update(value).digest('base64url'); }

export function createSessionToken(userId: string) {
  const payload = `${userId}.${Math.floor(Date.now() / 1000) + MAX_AGE}`;
  return `${payload}.${sign(payload)}`;
}

export async function getAdminSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const [userId, expiry, signature] = token.split('.');
  if (!userId || !expiry || !signature || Number(expiry) < Date.now() / 1000) return null;
  const expected = sign(`${userId}.${expiry}`);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  return { userId };
}

export function sessionCookie(token: string) {
  return { name: COOKIE_NAME, value: token, options: { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: MAX_AGE } };
}

export const expiredSessionCookie = { name: COOKIE_NAME, value: '', options: { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 } };
