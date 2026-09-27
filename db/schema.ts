import { boolean, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['admin']);
export const orderStatus = pgEnum('order_status', ['draft', 'quoted', 'deposit_pending', 'deposit_paid', 'confirmed', 'cancelled']);
export const priceMode = pgEnum('price_mode', ['per_person', 'per_event', 'per_table', 'per_8_children']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  role: userRole('role').notNull().default('admin'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const eventTypes = pgTable('event_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  title: varchar('title', { length: 120 }).notNull(),
  description: text('description').notNull(),
  durationLabel: varchar('duration_label', { length: 60 }).notNull(),
  pricePerGuest: integer('price_per_guest').notNull(),
  includedServices: text('included_services').array().notNull().default([]),
  details: jsonb('details').notNull().default([]),
  proposalPdf: varchar('proposal_pdf', { length: 255 }).notNull().default(''),
  active: boolean('active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const serviceAddons = pgTable('service_addons', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  title: varchar('title', { length: 120 }).notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  pricing: priceMode('pricing').notNull(),
  active: boolean('active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  reference: varchar('reference', { length: 30 }).notNull().unique(),
  customerName: varchar('customer_name', { length: 150 }),
  customerEmail: varchar('customer_email', { length: 255 }),
  customerPhone: varchar('customer_phone', { length: 40 }),
  eventDate: timestamp('event_date', { withTimezone: false }),
  guestCount: integer('guest_count').notNull(),
  childCount: integer('child_count').notNull().default(0),
  eventTypeId: uuid('event_type_id').references(() => eventTypes.id),
  subtotal: integer('subtotal').notNull(),
  total: integer('total').notNull(),
  depositAmount: integer('deposit_amount').notNull().default(0),
  paymentMethod: varchar('payment_method', { length: 20 }),
  depositDueAt: timestamp('deposit_due_at', { withTimezone: true }),
  status: orderStatus('status').notNull().default('draft'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  serviceAddonId: uuid('service_addon_id').references(() => serviceAddons.id),
  title: varchar('title', { length: 120 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: integer('unit_price').notNull(),
  total: integer('total').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
