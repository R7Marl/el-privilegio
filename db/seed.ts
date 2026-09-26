import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { getDb } from './index';
import { eventTypes, serviceAddons, users } from './schema';
import { eventStyles, extras } from '../app/data/quote-config';
import { hashPassword } from '../lib/password';

async function seed() {
  const db = getDb();
  const email = process.env.ADMIN_EMAIL ?? 'admin@elprivilegio.local';
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error('Define ADMIN_PASSWORD antes de ejecutar el seed.');

  const passwordHash = await hashPassword(password);
  await db.insert(users).values({ name: 'Administrador', email, passwordHash }).onConflictDoUpdate({ target: users.email, set: { name: 'Administrador', passwordHash, active: true, updatedAt: new Date() } });

  for (const [sortOrder, event] of eventStyles.entries()) {
    await db.insert(eventTypes).values({ slug: event.id, title: event.title, description: event.description, durationLabel: event.duration, pricePerGuest: event.pricePerGuest, includedServices: event.includes, details: event.details, proposalPdf: event.proposalPdf, sortOrder }).onConflictDoUpdate({ target: eventTypes.slug, set: { title: event.title, description: event.description, durationLabel: event.duration, pricePerGuest: event.pricePerGuest, includedServices: event.includes, details: event.details, proposalPdf: event.proposalPdf, sortOrder, updatedAt: new Date() } });
  }

  for (const [sortOrder, extra] of extras.entries()) {
    const pricing = extra.pricing === 'por persona' ? 'per_person' : extra.pricing === 'por mesa' ? 'per_table' : extra.pricing === 'por 8 niños' ? 'per_8_children' : 'per_event';
    await db.insert(serviceAddons).values({ slug: extra.id, title: extra.title, description: extra.description, price: extra.price, pricing, sortOrder }).onConflictDoUpdate({ target: serviceAddons.slug, set: { title: extra.title, description: extra.description, price: extra.price, pricing, sortOrder, updatedAt: new Date() } });
  }
}

seed().then(() => process.exit(0)).catch(error => { console.error(error); process.exit(1); });
