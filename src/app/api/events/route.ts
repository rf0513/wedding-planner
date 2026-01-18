import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'

const sqlite = new Database('wedding.db')

export async function GET() {
  try {
    const events = sqlite.prepare(`
      SELECT we.*,
        (SELECT COUNT(*) FROM guest_events ge WHERE ge.event_id = we.id) as total_guests,
        (SELECT COUNT(*) FROM guest_events ge WHERE ge.event_id = we.id AND ge.rsvp_status = 'confirmed') as confirmed_guests
      FROM wedding_events we
      ORDER BY we."order" ASC
    `).all()

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, date, startTime, endTime, venue, description, order } = body

    const result = sqlite.prepare(`
      INSERT INTO wedding_events (name, date, start_time, end_time, venue, description, "order")
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, date, startTime || null, endTime || null, venue || null, description || null, order || 0)

    const event = sqlite.prepare('SELECT * FROM wedding_events WHERE id = ?').get(result.lastInsertRowid)
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, date, startTime, endTime, venue, description, order, colors } = body

    // If only updating colors
    if (colors !== undefined && !name) {
      sqlite.prepare(`
        UPDATE wedding_events SET colors = ? WHERE id = ?
      `).run(JSON.stringify(colors), id)
    } else {
      sqlite.prepare(`
        UPDATE wedding_events
        SET name = ?, date = ?, start_time = ?, end_time = ?, venue = ?, description = ?, "order" = ?, colors = COALESCE(?, colors)
        WHERE id = ?
      `).run(name, date, startTime || null, endTime || null, venue || null, description || null, order || 0, colors ? JSON.stringify(colors) : null, id)
    }

    const event = sqlite.prepare('SELECT * FROM wedding_events WHERE id = ?').get(id)
    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    sqlite.prepare('DELETE FROM guest_events WHERE event_id = ?').run(id)
    sqlite.prepare('DELETE FROM itinerary_items WHERE event_id = ?').run(id)
    sqlite.prepare('DELETE FROM wedding_events WHERE id = ?').run(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
