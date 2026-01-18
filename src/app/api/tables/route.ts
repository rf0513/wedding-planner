import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/db'

export async function GET() {
  try {
    const tablesResult = await client.execute(`
      SELECT t.*,
        (SELECT COUNT(*) FROM guests g WHERE g.table_id = t.id) as seated_count
      FROM tables t
      ORDER BY t.name
    `)

    return NextResponse.json(tablesResult.rows)
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, capacity, positionX, positionY } = body

    const result = await client.execute({
      sql: `INSERT INTO tables (name, capacity, position_x, position_y) VALUES (?, ?, ?, ?)`,
      args: [name, capacity || 10, positionX || 0, positionY || 0]
    })

    const tableResult = await client.execute({
      sql: 'SELECT * FROM tables WHERE id = ?',
      args: [result.lastInsertRowid!]
    })
    return NextResponse.json(tableResult.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating table:', error)
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, capacity, positionX, positionY } = body

    await client.execute({
      sql: `UPDATE tables SET name = ?, capacity = ?, position_x = ?, position_y = ? WHERE id = ?`,
      args: [name, capacity || 10, positionX || 0, positionY || 0, id]
    })

    const tableResult = await client.execute({
      sql: 'SELECT * FROM tables WHERE id = ?',
      args: [id]
    })
    return NextResponse.json(tableResult.rows[0])
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
    await client.execute({ sql: 'UPDATE guests SET table_id = NULL WHERE table_id = ?', args: [id] })
    await client.execute({ sql: 'DELETE FROM tables WHERE id = ?', args: [id] })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting table:', error)
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 })
  }
}
