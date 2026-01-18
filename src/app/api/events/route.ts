import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/db'

export async function GET() {
  try {
    const eventsResult = await client.execute(`
      SELECT we.*,
        (SELECT COUNT(*) FROM guest_events ge WHERE ge.event_id = we.id) as total_guests,
        (SELECT COUNT(*) FROM guest_events ge WHERE ge.event_id = we.id AND ge.rsvp_status = 'confirmed') as confirmed_guests
      FROM wedding_events we
      ORDER BY we."order" ASC
    `)

    return NextResponse.json(eventsResult.rows)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, date, startTime, endTime, venue, description, order } = body

    const result = await client.execute({
      sql: `INSERT INTO wedding_events (name, date, start_time, end_time, venue, description, "order") VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [name, date, startTime || null, endTime || null, venue || null, description || null, order || 0]
    })

    const eventResult = await client.execute({
      sql: 'SELECT * FROM wedding_events WHERE id = ?',
      args: [result.lastInsertRowid]
    })
    return NextResponse.json(eventResult.rows[0], { status: 201 })
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
      await client.execute({
        sql: `UPDATE wedding_events SET colors = ? WHERE id = ?`,
        args: [JSON.stringify(colors), id]
      })
    } else {
      await client.execute({
        sql: `UPDATE wedding_events SET name = ?, date = ?, start_time = ?, end_time = ?, venue = ?, description = ?, "order" = ?, colors = COALESCE(?, colors) WHERE id = ?`,
        args: [name, date, startTime || null, endTime || null, venue || null, description || null, order || 0, colors ? JSON.stringify(colors) : null, id]
      })
    }

    const eventResult = await client.execute({
      sql: 'SELECT * FROM wedding_events WHERE id = ?',
      args: [id]
    })
    return NextResponse.json(eventResult.rows[0])
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

    await client.execute({ sql: 'DELETE FROM guest_events WHERE event_id = ?', args: [id] })
    await client.execute({ sql: 'DELETE FROM itinerary_items WHERE event_id = ?', args: [id] })
    await client.execute({ sql: 'DELETE FROM wedding_events WHERE id = ?', args: [id] })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
