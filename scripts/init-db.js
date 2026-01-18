const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const sqlite = new Database('wedding.db');

console.log('Initializing database...');

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

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

  CREATE TABLE IF NOT EXISTS budget_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER REFERENCES wedding_events(id),
    name TEXT NOT NULL,
    planned_amount REAL DEFAULT 0,
    "order" INTEGER DEFAULT 0
  );

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

  CREATE TABLE IF NOT EXISTS tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    capacity INTEGER DEFAULT 10,
    position_x REAL DEFAULT 0,
    position_y REAL DEFAULT 0
  );

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

  CREATE TABLE IF NOT EXISTS guest_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guest_id INTEGER REFERENCES guests(id),
    event_id INTEGER REFERENCES wedding_events(id),
    rsvp_status TEXT DEFAULT 'pending',
    meal_choice TEXT
  );

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

  CREATE TABLE IF NOT EXISTS calendar_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    type TEXT,
    related_id INTEGER,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS vision_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT NOT NULL,
    image_url TEXT,
    title TEXT,
    notes TEXT,
    "order" INTEGER DEFAULT 0
  );

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
`);

console.log('Tables created.');

// Seed users
const existingUsers = sqlite.prepare('SELECT COUNT(*) as count FROM users').get();
if (existingUsers.count === 0) {
  const password1 = bcrypt.hashSync('wedding2027', 10);
  const password2 = bcrypt.hashSync('wedding2027', 10);

  sqlite.prepare('INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)').run('partner1', password1, 'Partner 1', 'admin');
  sqlite.prepare('INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)').run('partner2', password2, 'Partner 2', 'admin');
  console.log('Users created: partner1, partner2 (password: wedding2027)');
}

// Seed wedding events
const existingEvents = sqlite.prepare('SELECT COUNT(*) as count FROM wedding_events').get();
if (existingEvents.count === 0) {
  const events = [
    { name: 'Mehendi', date: '2027-02-02', start_time: null, end_time: null, venue: 'TBD', order: 1 },
    { name: 'Haldi', date: '2027-02-03', start_time: '10:00', end_time: '13:00', venue: 'TBD', order: 2 },
    { name: 'Vows & Sangeet', date: '2027-02-03', start_time: '18:00', end_time: '23:00', venue: 'TBD', order: 3 },
    { name: 'Wedding Ceremony', date: '2027-02-04', start_time: '10:00', end_time: '14:00', venue: 'TBD', order: 4 },
    { name: 'Reception', date: '2027-02-04', start_time: '19:00', end_time: '23:00', venue: 'TBD', order: 5 }
  ];

  for (const event of events) {
    sqlite.prepare('INSERT INTO wedding_events (name, date, start_time, end_time, venue, "order") VALUES (?, ?, ?, ?, ?, ?)').run(event.name, event.date, event.start_time, event.end_time, event.venue, event.order);
  }
  console.log('Wedding events created.');
}

// Seed budget categories
const existingCategories = sqlite.prepare('SELECT COUNT(*) as count FROM budget_categories').get();
if (existingCategories.count === 0) {
  const categories = [
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
  ];

  categories.forEach((name, i) => {
    sqlite.prepare('INSERT INTO budget_categories (name, "order") VALUES (?, ?)').run(name, i);
  });
  console.log('Budget categories created.');
}

console.log('Database initialization complete!');
sqlite.close();
