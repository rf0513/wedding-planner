import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'

const sqlite = new Database('wedding.db')

export async function GET() {
  try {
    const guests = sqlite.prepare(`
      SELECT g.*, t.name as table_name
      FROM guests g
      LEFT JOIN tables t ON g.table_id = t.id
      ORDER BY g.last_name, g.first_name
    `).all()

    const guestEvents = sqlite.prepare(`
      SELECT ge.*, we.name as event_name
      FROM guest_events ge
      JOIN wedding_events we ON ge.event_id = we.id
    `).all()

    return NextResponse.json({ guests, guestEvents })
  } catch (error) {
    console.error('Error fetching guests:', error)
    return NextResponse.json({ guests: [], guestEvents: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      firstName, lastName, email, phone, group,
      mealPreference, dietaryRestrictions, plusOne, plusOneName, notes, eventIds
    } = body

    const result = sqlite.prepare(`
      INSERT INTO guests (first_name, last_name, email, phone, "group", meal_preference, dietary_restrictions, plus_one, plus_one_name, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      firstName, lastName || null, email || null, phone || null, group || null,
      mealPreference || null, dietaryRestrictions || null, plusOne ? 1 : 0, plusOneName || null, notes || null
    )

    const guestId = result.lastInsertRowid

    // Add guest to selected events
    if (eventIds && eventIds.length > 0) {
      const insertEvent = sqlite.prepare(`
        INSERT INTO guest_events (guest_id, event_id, rsvp_status)
        VALUES (?, ?, 'pending')
      `)
      for (const eventId of eventIds) {
        insertEvent.run(guestId, eventId)
      }
    }

    const guest = sqlite.prepare('SELECT * FROM guests WHERE id = ?').get(guestId)
    return NextResponse.json(guest, { status: 201 })
  } catch (error) {
    console.error('Error creating guest:', error)
    return NextResponse.json({ error: 'Failed to create guest' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id, firstName, lastName, email, phone, group,
      mealPreference, dietaryRestrictions, plusOne, plusOneName, tableId, notes, eventIds
    } = body

    sqlite.prepare(`
      UPDATE guests
      SET first_name = ?, last_name = ?, email = ?, phone = ?, "group" = ?,
          meal_preference = ?, dietary_restrictions = ?, plus_one = ?, plus_one_name = ?, table_id = ?, notes = ?
      WHERE id = ?
    `).run(
      firstName, lastName || null, email || null, phone || null, group || null,
      mealPreference || null, dietaryRestrictions || null, plusOne ? 1 : 0, plusOneName || null, tableId || null, notes || null, id
    )

    // Update event attendance
    if (eventIds !== undefined) {
      sqlite.prepare('DELETE FROM guest_events WHERE guest_id = ?').run(id)
      const insertEvent = sqlite.prepare(`
        INSERT INTO guest_events (guest_id, event_id, rsvp_status)
        VALUES (?, ?, 'pending')
      `)
      for (const eventId of eventIds) {
        insertEvent.run(id, eventId)
      }
    }

    const guest = sqlite.prepare('SELECT * FROM guests WHERE id = ?').get(id)
    return NextResponse.json(guest)
  } catch (error) {
    console.error('Error updating guest:', error)
    return NextResponse.json({ error: 'Failed to update guest' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Guest ID required' }, { status: 400 })
    }

    sqlite.prepare('DELETE FROM guest_events WHERE guest_id = ?').run(id)
    sqlite.prepare('DELETE FROM guests WHERE id = ?').run(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting guest:', error)
    return NextResponse.json({ error: 'Failed to delete guest' }, { status: 500 })
  }
}
