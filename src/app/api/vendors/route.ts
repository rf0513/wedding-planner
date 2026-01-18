import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'

const sqlite = new Database('wedding.db')

export async function GET() {
  try {
    const vendors = sqlite.prepare(`
      SELECT * FROM vendors ORDER BY category, name
    `).all()

    return NextResponse.json(vendors)
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      category, name, contactName, email, phone,
      website, contractUrl, totalCost, paid, notes
    } = body

    const result = sqlite.prepare(`
      INSERT INTO vendors (category, name, contact_name, email, phone, website, contract_url, total_cost, paid, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      category, name, contactName || null, email || null, phone || null,
      website || null, contractUrl || null, totalCost || 0, paid || 0, notes || null
    )

    const vendor = sqlite.prepare('SELECT * FROM vendors WHERE id = ?').get(result.lastInsertRowid)
    return NextResponse.json(vendor, { status: 201 })
  } catch (error) {
    console.error('Error creating vendor:', error)
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id, category, name, contactName, email, phone,
      website, contractUrl, totalCost, paid, notes
    } = body

    sqlite.prepare(`
      UPDATE vendors
      SET category = ?, name = ?, contact_name = ?, email = ?, phone = ?,
          website = ?, contract_url = ?, total_cost = ?, paid = ?, notes = ?
      WHERE id = ?
    `).run(
      category, name, contactName || null, email || null, phone || null,
      website || null, contractUrl || null, totalCost || 0, paid || 0, notes || null, id
    )

    const vendor = sqlite.prepare('SELECT * FROM vendors WHERE id = ?').get(id)
    return NextResponse.json(vendor)
  } catch (error) {
    console.error('Error updating vendor:', error)
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Vendor ID required' }, { status: 400 })
    }

    sqlite.prepare('DELETE FROM vendors WHERE id = ?').run(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting vendor:', error)
    return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 })
  }
}
