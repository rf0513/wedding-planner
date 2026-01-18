import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/db'

export async function GET() {
  try {
    const guestsResult = await client.execute(`
      SELECT g.*, t.name as table_name
      FROM guests g
      LEFT JOIN tables t ON g.table_id = t.id
      ORDER BY g.last_name, g.first_name
    `)

    const guestEventsResult = await client.execute(`
      SELECT ge.*, we.name as event_name
      FROM guest_events ge
      JOIN wedding_events we ON ge.event_id = we.id
    `)

    return NextResponse.json({ guests: guestsResult.rows, guestEvents: guestEventsResult.rows })
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

    const result = await client.execute({
      sql: `INSERT INTO guests (first_name, last_name, email, phone, "group", meal_preference, dietary_restrictions, plus_one, plus_one_name, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        firstName, lastName || null, email || null, phone || null, group || null,
        mealPreference || null, dietaryRestrictions || null, plusOne ? 1 : 0, plusOneName || null, notes || null
      ]
    })

    const guestId = result.lastInsertRowid

    // Add guest to selected events
    if (eventIds && eventIds.length > 0 && guestId) {
      for (const eventId of eventIds) {
        await client.execute({
          sql: `INSERT INTO guest_events (guest_id, event_id, rsvp_status) VALUES (?, ?, 'pending')`,
          args: [guestId, eventId]
        })
      }
    }

    const guestResult = await client.execute({
      sql: 'SELECT * FROM guests WHERE id = ?',
      args: [guestId!]
    })
    return NextResponse.json(guestResult.rows[0], { status: 201 })
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

    await client.execute({
      sql: `UPDATE guests SET first_name = ?, last_name = ?, email = ?, phone = ?, "group" = ?, meal_preference = ?, dietary_restrictions = ?, plus_one = ?, plus_one_name = ?, table_id = ?, notes = ? WHERE id = ?`,
      args: [
        firstName, lastName || null, email || null, phone || null, group || null,
        mealPreference || null, dietaryRestrictions || null, plusOne ? 1 : 0, plusOneName || null, tableId || null, notes || null, id
      ]
    })

    // Update event attendance
    if (eventIds !== undefined) {
      await client.execute({ sql: 'DELETE FROM guest_events WHERE guest_id = ?', args: [id] })

      for (const eventId of eventIds) {
        await client.execute({
          sql: `INSERT INTO guest_events (guest_id, event_id, rsvp_status) VALUES (?, ?, 'pending')`,
          args: [id, eventId]
        })
      }
    }

    const guestResult = await client.execute({
      sql: 'SELECT * FROM guests WHERE id = ?',
      args: [id]
    })
    return NextResponse.json(guestResult.rows[0])
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

    await client.execute({ sql: 'DELETE FROM guest_events WHERE guest_id = ?', args: [id] })
    await client.execute({ sql: 'DELETE FROM guests WHERE id = ?', args: [id] })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting guest:', error)
    return NextResponse.json({ error: 'Failed to delete guest' }, { status: 500 })
  }
}
