import { NextResponse } from 'next/server'
import { client } from '@/lib/db'

interface GuestRow {
  id: number
  first_name: string
  last_name: string | null
  email: string | null
  phone: string | null
  group: string | null
  meal_preference: string | null
  dietary_restrictions: string | null
  notes: string | null
}

interface GuestEventRow {
  guest_id: number
  event_name: string
  rsvp_status: string
}

// Escape CSV field (wrap in quotes if needed)
function escapeCSV(value: string | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET() {
  try {
    const guestsResult = await client.execute(`
      SELECT id, first_name, last_name, email, phone, "group", meal_preference, dietary_restrictions, notes
      FROM guests
      ORDER BY last_name, first_name
    `)
    const guests = guestsResult.rows as unknown as GuestRow[]

    const guestEventsResult = await client.execute(`
      SELECT ge.guest_id, we.name as event_name, ge.rsvp_status
      FROM guest_events ge
      JOIN wedding_events we ON ge.event_id = we.id
    `)
    const guestEvents = guestEventsResult.rows as unknown as GuestEventRow[]

    // Get unique event names for columns
    const eventNames = [...new Set(guestEvents.map(ge => ge.event_name))]

    // Build CSV header
    const headers = [
      'first_name',
      'last_name',
      'email',
      'phone',
      'group',
      'meal_preference',
      'dietary_restrictions',
      'notes',
      ...eventNames.map(name => `rsvp_${name.toLowerCase().replace(/\s+/g, '_')}`)
    ]

    // Build CSV rows
    const rows = guests.map(guest => {
      const guestRsvps = guestEvents.filter(ge => ge.guest_id === guest.id)

      const rsvpValues = eventNames.map(eventName => {
        const rsvp = guestRsvps.find(gr => gr.event_name === eventName)
        return rsvp?.rsvp_status || ''
      })

      return [
        escapeCSV(guest.first_name),
        escapeCSV(guest.last_name),
        escapeCSV(guest.email),
        escapeCSV(guest.phone),
        escapeCSV(guest.group),
        escapeCSV(guest.meal_preference),
        escapeCSV(guest.dietary_restrictions),
        escapeCSV(guest.notes),
        ...rsvpValues.map(escapeCSV)
      ].join(',')
    })

    const csv = [headers.join(','), ...rows].join('\n')

    // Return as downloadable file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="wedding-guests-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Error exporting guests:', error)
    return NextResponse.json({ error: 'Failed to export guests' }, { status: 500 })
  }
}
