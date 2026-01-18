import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').default('user'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP')
})

// Wedding Events (multi-day celebration)
export const weddingEvents = sqliteTable('wedding_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  date: text('date').notNull(),
  startTime: text('start_time'),
  endTime: text('end_time'),
  venue: text('venue'),
  description: text('description'),
  order: integer('order').default(0)
})

// Budget Categories
export const budgetCategories = sqliteTable('budget_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').references(() => weddingEvents.id),
  name: text('name').notNull(),
  plannedAmount: real('planned_amount').default(0),
  order: integer('order').default(0)
})

// Budget Items
export const budgetItems = sqliteTable('budget_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id').references(() => budgetCategories.id),
  name: text('name').notNull(),
  vendor: text('vendor'),
  planned: real('planned').default(0),
  actual: real('actual').default(0),
  paid: real('paid').default(0),
  dueDate: text('due_date'),
  notes: text('notes')
})

// Guests
export const guests = sqliteTable('guests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  email: text('email'),
  phone: text('phone'),
  group: text('group'),
  mealPreference: text('meal_preference'),
  dietaryRestrictions: text('dietary_restrictions'),
  plusOne: integer('plus_one').default(0),
  plusOneName: text('plus_one_name'),
  tableId: integer('table_id').references(() => tables.id),
  notes: text('notes')
})

// Guest-Event attendance (which guests attend which events)
export const guestEvents = sqliteTable('guest_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  guestId: integer('guest_id').references(() => guests.id),
  eventId: integer('event_id').references(() => weddingEvents.id),
  rsvpStatus: text('rsvp_status').default('pending'),
  mealChoice: text('meal_choice')
})

// Tables (for seating)
export const tables = sqliteTable('tables', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  capacity: integer('capacity').default(10),
  positionX: real('position_x').default(0),
  positionY: real('position_y').default(0)
})

// Tasks (To-Do List)
export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: text('due_date'),
  priority: text('priority').default('medium'),
  category: text('category'),
  assignedTo: integer('assigned_to').references(() => users.id),
  completed: integer('completed').default(0),
  completedAt: text('completed_at'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP')
})

// Calendar Events
export const calendarEvents = sqliteTable('calendar_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  date: text('date').notNull(),
  time: text('time'),
  type: text('type'),
  relatedId: integer('related_id'),
  notes: text('notes')
})

// Vision Board Items
export const visionItems = sqliteTable('vision_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  section: text('section').notNull(),
  imageUrl: text('image_url'),
  title: text('title'),
  notes: text('notes'),
  order: integer('order').default(0)
})

// Vendors
export const vendors = sqliteTable('vendors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  category: text('category').notNull(),
  name: text('name').notNull(),
  contactName: text('contact_name'),
  email: text('email'),
  phone: text('phone'),
  website: text('website'),
  contractUrl: text('contract_url'),
  totalCost: real('total_cost').default(0),
  paid: real('paid').default(0),
  notes: text('notes')
})

// Wedding Party
export const weddingParty = sqliteTable('wedding_party', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  role: text('role').notNull(),
  side: text('side'),
  email: text('email'),
  phone: text('phone'),
  responsibilities: text('responsibilities'),
  attireDetails: text('attire_details'),
  notes: text('notes')
})

// Itinerary Items
export const itineraryItems = sqliteTable('itinerary_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').references(() => weddingEvents.id),
  time: text('time').notNull(),
  title: text('title').notNull(),
  location: text('location'),
  people: text('people'),
  notes: text('notes'),
  order: integer('order').default(0)
})

// Type exports
export type User = typeof users.$inferSelect
export type WeddingEvent = typeof weddingEvents.$inferSelect
export type BudgetCategory = typeof budgetCategories.$inferSelect
export type BudgetItem = typeof budgetItems.$inferSelect
export type Guest = typeof guests.$inferSelect
export type GuestEvent = typeof guestEvents.$inferSelect
export type Table = typeof tables.$inferSelect
export type Task = typeof tasks.$inferSelect
export type CalendarEvent = typeof calendarEvents.$inferSelect
export type VisionItem = typeof visionItems.$inferSelect
export type Vendor = typeof vendors.$inferSelect
export type WeddingPartyMember = typeof weddingParty.$inferSelect
export type ItineraryItem = typeof itineraryItems.$inferSelect
