import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/db'

export async function GET() {
  try {
    const membersResult = await client.execute(`
      SELECT * FROM wedding_party ORDER BY side, role
    `)

    return NextResponse.json(membersResult.rows)
  } catch (error) {
    console.error('Error fetching wedding party:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, role, side, email, phone, responsibilities, attireDetails, notes } = body

    const result = await client.execute({
      sql: `INSERT INTO wedding_party (name, role, side, email, phone, responsibilities, attire_details, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [name, role, side || null, email || null, phone || null, responsibilities || null, attireDetails || null, notes || null]
    })

    const memberResult = await client.execute({
      sql: 'SELECT * FROM wedding_party WHERE id = ?',
      args: [result.lastInsertRowid ? Number(result.lastInsertRowid) : 0]
    })
    return NextResponse.json(memberResult.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating wedding party member:', error)
    return NextResponse.json({ error: 'Failed to create wedding party member' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, role, side, email, phone, responsibilities, attireDetails, notes } = body

    await client.execute({
      sql: `UPDATE wedding_party SET name = ?, role = ?, side = ?, email = ?, phone = ?, responsibilities = ?, attire_details = ?, notes = ? WHERE id = ?`,
      args: [name, role, side || null, email || null, phone || null, responsibilities || null, attireDetails || null, notes || null, id]
    })

    const memberResult = await client.execute({
      sql: 'SELECT * FROM wedding_party WHERE id = ?',
      args: [id]
    })
    return NextResponse.json(memberResult.rows[0])
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

    await client.execute({ sql: 'DELETE FROM wedding_party WHERE id = ?', args: [id] })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting wedding party member:', error)
    return NextResponse.json({ error: 'Failed to delete wedding party member' }, { status: 500 })
  }
}
