import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'

const sqlite = new Database('wedding.db')

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { guestId, eventId, rsvpStatus, mealChoice } = body

    sqlite.prepare(`
      UPDATE guest_events
      SET rsvp_status = ?, meal_choice = ?
      WHERE guest_id = ? AND event_id = ?
    `).run(rsvpStatus, mealChoice || null, guestId, eventId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating RSVP:', error)
    return NextResponse.json({ error: 'Failed to update RSVP' }, { status: 500 })
  }
}
