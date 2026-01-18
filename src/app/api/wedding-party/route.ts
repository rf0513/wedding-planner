import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'

const sqlite = new Database('wedding.db')

export async function GET() {
  try {
    const members = sqlite.prepare(`
      SELECT * FROM wedding_party ORDER BY side, role
    `).all()

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching wedding party:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, role, side, email, phone, responsibilities, attireDetails, notes } = body

    const result = sqlite.prepare(`
      INSERT INTO wedding_party (name, role, side, email, phone, responsibilities, attire_details, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, role, side || null, email || null, phone || null, responsibilities || null, attireDetails || null, notes || null)

    const member = sqlite.prepare('SELECT * FROM wedding_party WHERE id = ?').get(result.lastInsertRowid)
    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Error creating wedding party member:', error)
    return NextResponse.json({ error: 'Failed to create wedding party member' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, role, side, email, phone, responsibilities, attireDetails, notes } = body

    sqlite.prepare(`
      UPDATE wedding_party
      SET name = ?, role = ?, side = ?, email = ?, phone = ?, responsibilities = ?, attire_details = ?, notes = ?
      WHERE id = ?
    `).run(name, role, side || null, email || null, phone || null, responsibilities || null, attireDetails || null, notes || null, id)

    const member = sqlite.prepare('SELECT * FROM wedding_party WHERE id = ?').get(id)
    return NextResponse.json(member)
  } catch (error) {
    console.error('Error updating wedding party member:', error)
    return NextResponse.json({ error: 'Failed to update wedding party member' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 })
    }

    sqlite.prepare('DELETE FROM wedding_party WHERE id = ?').run(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting wedding party member:', error)
    return NextResponse.json({ error: 'Failed to delete wedding party member' }, { status: 500 })
  }
}
