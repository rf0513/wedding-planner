import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/db'

export async function GET() {
  try {
    const itemsResult = await client.execute(`
      SELECT ii.*, we.name as event_name, we.date as event_date
      FROM itinerary_items ii
      JOIN wedding_events we ON ii.event_id = we.id
      ORDER BY we."order" ASC, ii."order" ASC, ii.time ASC
    `)

    return NextResponse.json(itemsResult.rows)
  } catch (error) {
    console.error('Error fetching itinerary:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, time, title, location, people, notes, order } = body

    const result = await client.execute({
      sql: `INSERT INTO itinerary_items (event_id, time, title, location, people, notes, "order") VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [eventId, time, title, location || null, people || null, notes || null, order || 0]
    })

    const itemResult = await client.execute({
      sql: 'SELECT * FROM itinerary_items WHERE id = ?',
      args: [result.lastInsertRowid ? Number(result.lastInsertRowid) : 0]
    })
    return NextResponse.json(itemResult.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating itinerary item:', error)
    return NextResponse.json({ error: 'Failed to create itinerary item' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, eventId, time, title, location, people, notes, order } = body

    await client.execute({
      sql: `UPDATE itinerary_items SET event_id = ?, time = ?, title = ?, location = ?, people = ?, notes = ?, "order" = ? WHERE id = ?`,
      args: [eventId, time, title, location || null, people || null, notes || null, order || 0, id]
    })

    const itemResult = await client.execute({
      sql: 'SELECT * FROM itinerary_items WHERE id = ?',
      args: [id]
    })
    return NextResponse.json(itemResult.rows[0])
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

    await client.execute({ sql: 'DELETE FROM itinerary_items WHERE id = ?', args: [id] })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting itinerary item:', error)
    return NextResponse.json({ error: 'Failed to delete itinerary item' }, { status: 500 })
  }
}
