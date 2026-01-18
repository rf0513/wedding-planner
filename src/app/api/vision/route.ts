import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'

const sqlite = new Database('wedding.db')

export async function GET() {
  try {
    const items = sqlite.prepare(`
      SELECT * FROM vision_items ORDER BY section, "order"
    `).all()

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching vision items:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { section, imageUrl, title, notes, order } = body

    const result = sqlite.prepare(`
      INSERT INTO vision_items (section, image_url, title, notes, "order")
      VALUES (?, ?, ?, ?, ?)
    `).run(section, imageUrl || null, title || null, notes || null, order || 0)

    const item = sqlite.prepare('SELECT * FROM vision_items WHERE id = ?').get(result.lastInsertRowid)
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating vision item:', error)
    return NextResponse.json({ error: 'Failed to create vision item' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, section, imageUrl, title, notes, order } = body

    sqlite.prepare(`
      UPDATE vision_items
      SET section = ?, image_url = ?, title = ?, notes = ?, "order" = ?
      WHERE id = ?
    `).run(section, imageUrl || null, title || null, notes || null, order || 0, id)

    const item = sqlite.prepare('SELECT * FROM vision_items WHERE id = ?').get(id)
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating vision item:', error)
    return NextResponse.json({ error: 'Failed to update vision item' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Vision item ID required' }, { status: 400 })
    }

    sqlite.prepare('DELETE FROM vision_items WHERE id = ?').run(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting vision item:', error)
    return NextResponse.json({ error: 'Failed to delete vision item' }, { status: 500 })
  }
}
