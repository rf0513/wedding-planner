import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'

const sqlite = new Database('wedding.db')

export async function GET() {
  try {
    const items = sqlite.prepare(`
      SELECT ii.*, we.name as event_name, we.date as event_date
      FROM itinerary_items ii
      JOIN wedding_events we ON ii.event_id = we.id
      ORDER BY we."order" ASC, ii."order" ASC, ii.time ASC
    `).all()

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching itinerary:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, time, title, location, people, notes, order } = body

    const result = sqlite.prepare(`
      INSERT INTO itinerary_items (event_id, time, title, location, people, notes, "order")
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(eventId, time, title, location || null, people || null, notes || null, order || 0)

    const item = sqlite.prepare('SELECT * FROM itinerary_items WHERE id = ?').get(result.lastInsertRowid)
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating itinerary item:', error)
    return NextResponse.json({ error: 'Failed to create itinerary item' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, eventId, time, title, location, people, notes, order } = body

    sqlite.prepare(`
      UPDATE itinerary_items
      SET event_id = ?, time = ?, title = ?, location = ?, people = ?, notes = ?, "order" = ?
      WHERE id = ?
    `).run(eventId, time, title, location || null, people || null, notes || null, order || 0, id)

    const item = sqlite.prepare('SELECT * FROM itinerary_items WHERE id = ?').get(id)
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating itinerary item:', error)
    return NextResponse.json({ error: 'Failed to update itinerary item' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Itinerary item ID required' }, { status: 400 })
    }

    sqlite.prepare('DELETE FROM itinerary_items WHERE id = ?').run(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting itinerary item:', error)
    return NextResponse.json({ error: 'Failed to delete itinerary item' }, { status: 500 })
  }
}
