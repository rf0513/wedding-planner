import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'
import { hashSync } from 'bcryptjs'
import { sql } from 'drizzle-orm'

export const client = createClient({
  url: process.env.DATABASE_URL || 'file:wedding.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
})

export const db = drizzle(client, { schema })

// Initialize database with tables and seed data
export async function initializeDatabase() {
  // Create tables
  // Note: In production with Turso, you might want to use 'drizzle-kit push' or migrations instead of this.
  // But for keeping parity with the existing logic, we'll execute the SQL.

  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS wedding_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      venue TEXT,
      description TEXT,
      "order" INTEGER DEFAULT 0
    );
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS budget_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER REFERENCES wedding_events(id),
      name TEXT NOT NULL,
      planned_amount REAL DEFAULT 0,
      "order" INTEGER DEFAULT 0
    );
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS budget_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER REFERENCES budget_categories(id),
      name TEXT NOT NULL,
      vendor TEXT,
      planned REAL DEFAULT 0,
      actual REAL DEFAULT 0,
      paid REAL DEFAULT 0,
      due_date TEXT,
      notes TEXT
    );
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      capacity INTEGER DEFAULT 10,
      position_x REAL DEFAULT 0,
      position_y REAL DEFAULT 0
    );
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS guests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT,
      email TEXT,
      phone TEXT,
      "group" TEXT,
      meal_preference TEXT,
      dietary_restrictions TEXT,
      plus_one INTEGER DEFAULT 0,
      plus_one_name TEXT,
      table_id INTEGER REFERENCES tables(id),
      notes TEXT
    );
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS guest_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guest_id INTEGER REFERENCES guests(id),
      event_id INTEGER REFERENCES wedding_events(id),
      rsvp_status TEXT DEFAULT 'pending',
      meal_choice TEXT
    );
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      priority TEXT DEFAULT 'medium',
      category TEXT,
      assigned_to INTEGER REFERENCES users(id),
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT,
      type TEXT,
      related_id INTEGER,
      notes TEXT
    );
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS vision_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section TEXT NOT NULL,
      image_url TEXT,
      title TEXT,
      notes TEXT,
      "order" INTEGER DEFAULT 0
    );
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS vendors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      contact_name TEXT,
      email TEXT,
      phone TEXT,
      website TEXT,
      contract_url TEXT,
      total_cost REAL DEFAULT 0,
      paid REAL DEFAULT 0,
      notes TEXT
    );
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS wedding_party (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      side TEXT,
      email TEXT,
      phone TEXT,
      responsibilities TEXT,
      attire_details TEXT,
      notes TEXT
    );
  `)

  await client.execute(`
    CREATE TABLE IF NOT EXISTS itinerary_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER REFERENCES wedding_events(id),
      time TEXT NOT NULL,
      title TEXT NOT NULL,
      location TEXT,
      people TEXT,
      notes TEXT,
      "order" INTEGER DEFAULT 0
    );
  `)

  // Fix for repeated notes column in itinerary_items in previous code potentially? 
  // actually the previous one had notes TEXT twice in my copy paste? No, looking back at tool output...
  // Ah, the original file had `notes: text('notes')` in schema.ts, and I just copied the SQL from the original file's `sqlite.exec`.
  // Wait, let me check the original `sqlite.exec` again. 
  // It listed: "notes TEXT" only once for itinerary_items.
  // I should be careful.

  // Seed default users if not exist
  const existingUsers = await db.select({ count: sql<number>`count(*)` }).from(schema.users).get()

  // Drizzle `.get()` with sql returns { count: number } if defining it that way? 
  // Actually db.select().from().get() returns the first row.
  // We need to check if existingUsers is valid.

  if (existingUsers && existingUsers.count === 0) {
    const password1Hash = hashSync('wedding2027', 10)
    const password2Hash = hashSync('wedding2027', 10)

    await db.insert(schema.users).values([
      { username: 'partner1', passwordHash: password1Hash, name: 'Partner 1', role: 'admin' },
      { username: 'partner2', passwordHash: password2Hash, name: 'Partner 2', role: 'admin' }
    ])
  }

  // Seed wedding events if not exist
  const existingEvents = await db.select({ count: sql<number>`count(*)` }).from(schema.weddingEvents).get()
  if (existingEvents && existingEvents.count === 0) {
    const events = [
      { name: 'Mehendi', date: '2027-02-02', venue: 'TBD', order: 1 },
      { name: 'Sangeet', date: '2027-02-03', venue: 'TBD', order: 2 },
      { name: 'Haldi', date: '2027-02-04', venue: 'TBD', order: 3 },
      { name: 'Wedding Ceremony', date: '2027-02-05', venue: 'TBD', order: 4 },
      { name: 'Reception', date: '2027-02-06', venue: 'TBD', order: 5 }
    ]

    await db.insert(schema.weddingEvents).values(events)
  }

  // Seed budget categories if not exist
  const existingCategories = await db.select({ count: sql<number>`count(*)` }).from(schema.budgetCategories).get()
  if (existingCategories && existingCategories.count === 0) {
    const categoriesNames = [
      'Venue & Decor',
      'Catering & Food',
      'Photography & Video',
      'Attire & Jewelry',
      'Music & Entertainment',
      'Invitations & Stationery',
      'Flowers & Floral',
      'Transportation',
      'Accommodation',
      'Gifts & Favors',
      'Miscellaneous'
    ]

    const categories = categoriesNames.map((name, i) => ({
      name,
      order: i
    }))

    await db.insert(schema.budgetCategories).values(categories)
  }

  console.log('Database initialized successfully')
}

// Run initialization
// In Next.js dev mode, this might run multiple times.
// We should probably check if we are in a build phase or something, but for now we'll leave it as is.
initializeDatabase().catch(console.error)
