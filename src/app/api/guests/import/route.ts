import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/db'

interface ImportedGuest {
  first_name: string
  last_name?: string
  email?: string
  phone?: string
  group?: string
  meal_preference?: string
  dietary_restrictions?: string
  notes?: string
}

interface WeddingEvent {
  id: number
  name: string
}

// Normalize column names to handle variations
function normalizeColumnName(col: string): string {
  const normalized = col.toLowerCase().trim().replace(/[\s_-]+/g, '_')

  const mappings: Record<string, string> = {
    'firstname': 'first_name',
    'first': 'first_name',
    'fname': 'first_name',
    'lastname': 'last_name',
    'last': 'last_name',
    'lname': 'last_name',
    'surname': 'last_name',
    'email_address': 'email',
    'emailaddress': 'email',
    'phone_number': 'phone',
    'phonenumber': 'phone',
    'mobile': 'phone',
    'cell': 'phone',
    'telephone': 'phone',
    'category': 'group',
    'guest_group': 'group',
    'meal': 'meal_preference',
    'meal_pref': 'meal_preference',
    'food': 'meal_preference',
    'food_preference': 'meal_preference',
    'dietary': 'dietary_restrictions',
    'diet': 'dietary_restrictions',
    'allergies': 'dietary_restrictions',
    'restrictions': 'dietary_restrictions',
    'note': 'notes',
    'comment': 'notes',
    'comments': 'notes',
  }

  return mappings[normalized] || normalized
}

// Normalize event name for column matching
function normalizeEventName(name: string): string {
  return name.toLowerCase().trim().replace(/[\s_-]+/g, '_')
}

// Check if a value is truthy (yes, true, 1, y)
function isTruthyValue(value: string | undefined): boolean {
  if (!value) return false
  const v = value.toLowerCase().trim()
  return v === 'yes' || v === 'true' || v === '1' || v === 'y' || v === 'x'
}

// Parse CSV with proper handling of quoted fields
function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim())
  if (lines.length < 2) return []

  // Parse header row
  const headers = parseCSVLine(lines[0]).map(normalizeColumnName)

  // Parse data rows
  const data: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === 0 || values.every(v => !v.trim())) continue

    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || ''
    })
    data.push(row)
  }

  return data
}

// Parse a single CSV line, handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)

  return result
}

// Check if a guest is a duplicate
function isDuplicate(guest: ImportedGuest, existingGuests: Array<{ first_name: string; last_name: string | null; email: string | null }>): boolean {
  const firstName = guest.first_name?.toLowerCase().trim()
  const lastName = (guest.last_name || '').toLowerCase().trim()
  const email = (guest.email || '').toLowerCase().trim()

  for (const existing of existingGuests) {
    // Match by email if both have it
    if (email && existing.email && email === existing.email.toLowerCase()) {
      return true
    }

    // Match by name
    const existingFirst = existing.first_name.toLowerCase().trim()
    const existingLast = (existing.last_name || '').toLowerCase().trim()

    if (firstName === existingFirst && lastName === existingLast) {
      return true
    }
  }

  return false
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const csvText = await file.text()
    const rows = parseCSV(csvText)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No data found in file' }, { status: 400 })
    }

    // Get existing guests for deduplication
    const existingGuestsResult = await client.execute('SELECT first_name, last_name, email FROM guests')
    const existingGuests = existingGuestsResult.rows as unknown as Array<{ first_name: string; last_name: string | null; email: string | null }>

    // Get all events with names for matching columns
    const eventsResult = await client.execute('SELECT id, name FROM wedding_events')
    const events = eventsResult.rows as unknown as WeddingEvent[]

    // Create a map of normalized event names to event IDs
    const eventNameToId: Record<string, number> = {}
    for (const event of events) {
      eventNameToId[normalizeEventName(event.name)] = event.id
    }

    let imported = 0
    let skipped = 0
    const errors: string[] = []

    // Check if any row has event columns specified
    const firstRow = rows[0]
    const hasEventColumns = Object.keys(firstRow).some(col => eventNameToId[col] !== undefined)

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]

      // Validate required field
      if (!row.first_name?.trim()) {
        errors.push(`Row ${i + 2}: Missing first_name`)
        continue
      }

      const guest: ImportedGuest = {
        first_name: row.first_name.trim(),
        last_name: row.last_name?.trim() || undefined,
        email: row.email?.trim() || undefined,
        phone: row.phone?.trim() || undefined,
        group: row.group?.trim() || undefined,
        meal_preference: row.meal_preference?.trim() || undefined,
        dietary_restrictions: row.dietary_restrictions?.trim() || undefined,
        notes: row.notes?.trim() || undefined,
      }

      // Check for duplicates
      if (isDuplicate(guest, existingGuests)) {
        skipped++
        continue
      }

      try {
        const result = await client.execute({
          sql: `INSERT INTO guests (first_name, last_name, email, phone, "group", meal_preference, dietary_restrictions, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            guest.first_name,
            guest.last_name || null,
            guest.email || null,
            guest.phone || null,
            guest.group || null,
            guest.meal_preference || null,
            guest.dietary_restrictions || null,
            guest.notes || null
          ]
        })

        const guestId = result.lastInsertRowid

        // Determine which events to add the guest to
        if (hasEventColumns && guestId) {
          // Add guest only to events marked as true in the spreadsheet
          for (const [normalizedName, eventId] of Object.entries(eventNameToId)) {
            if (isTruthyValue(row[normalizedName])) {
              await client.execute({
                sql: `INSERT INTO guest_events (guest_id, event_id, rsvp_status) VALUES (?, ?, 'pending')`,
                args: [guestId, eventId]
              })
            }
          }
        } else if (guestId) {
          // No event columns specified - add guest to all events (backward compatible)
          for (const event of events) {
            await client.execute({
              sql: `INSERT INTO guest_events (guest_id, event_id, rsvp_status) VALUES (?, ?, 'pending')`,
              args: [guestId, event.id]
            })
          }
        }

        // Add to existing guests list for deduplication of subsequent rows
        existingGuests.push({
          first_name: guest.first_name,
          last_name: guest.last_name || null,
          email: guest.email || null
        })

        imported++
      } catch (err) {
        errors.push(`Row ${i + 2}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors: errors.slice(0, 10), // Return first 10 errors
      totalErrors: errors.length
    })
  } catch (error) {
    console.error('Error importing guests:', error)
    return NextResponse.json({ error: 'Failed to import guests' }, { status: 500 })
  }
}
