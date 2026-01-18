import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'

const sqlite = new Database('wedding.db')

export async function GET() {
  try {
    const tables = sqlite.prepare(`
      SELECT t.*,
        (SELECT COUNT(*) FROM guests g WHERE g.table_id = t.id) as seated_count
      FROM tables t
      ORDER BY t.name
    `).all()

    return NextResponse.json(tables)
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, capacity, positionX, positionY } = body

    const result = sqlite.prepare(`
      INSERT INTO tables (name, capacity, position_x, position_y)
      VALUES (?, ?, ?, ?)
    `).run(name, capacity || 10, positionX || 0, positionY || 0)

    const table = sqlite.prepare('SELECT * FROM tables WHERE id = ?').get(result.lastInsertRowid)
    return NextResponse.json(table, { status: 201 })
  } catch (error) {
    console.error('Error creating table:', error)
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, capacity, positionX, positionY } = body

    sqlite.prepare(`
      UPDATE tables
      SET name = ?, capacity = ?, position_x = ?, position_y = ?
      WHERE id = ?
    `).run(name, capacity || 10, positionX || 0, positionY || 0, id)

    const table = sqlite.prepare('SELECT * FROM tables WHERE id = ?').get(id)
    return NextResponse.json(table)
  } catch (error) {
    console.error('Error updating table:', error)
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Table ID required' }, { status: 400 })
    }

    // Remove guests from this table first
    sqlite.prepare('UPDATE guests SET table_id = NULL WHERE table_id = ?').run(id)
    sqlite.prepare('DELETE FROM tables WHERE id = ?').run(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting table:', error)
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 })
  }
}
