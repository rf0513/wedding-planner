import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/db'

export async function GET() {
  try {
    const itemsResult = await client.execute(`
      SELECT * FROM vision_items ORDER BY section, "order"
    `)

    return NextResponse.json(itemsResult.rows)
  } catch (error) {
    console.error('Error fetching vision items:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { section, imageUrl, title, notes, order } = body

    const result = await client.execute({
      sql: `INSERT INTO vision_items (section, image_url, title, notes, "order") VALUES (?, ?, ?, ?, ?)`,
      args: [section, imageUrl || null, title || null, notes || null, order || 0]
    })

    const itemResult = await client.execute({
      sql: 'SELECT * FROM vision_items WHERE id = ?',
      args: [result.lastInsertRowid ? Number(result.lastInsertRowid) : 0]
    })
    return NextResponse.json(itemResult.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating vision item:', error)
    return NextResponse.json({ error: 'Failed to create vision item' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, section, imageUrl, title, notes, order } = body

    await client.execute({
      sql: `UPDATE vision_items SET section = ?, image_url = ?, title = ?, notes = ?, "order" = ? WHERE id = ?`,
      args: [section, imageUrl || null, title || null, notes || null, order || 0, id]
    })

    const itemResult = await client.execute({
      sql: 'SELECT * FROM vision_items WHERE id = ?',
      args: [id]
    })
    return NextResponse.json(itemResult.rows[0])
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

    await client.execute({ sql: 'DELETE FROM vision_items WHERE id = ?', args: [id] })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting vision item:', error)
    return NextResponse.json({ error: 'Failed to delete vision item' }, { status: 500 })
  }
}
