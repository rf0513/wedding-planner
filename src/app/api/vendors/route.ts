import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/db'

export async function GET() {
  try {
    const vendorsResult = await client.execute(`
      SELECT * FROM vendors ORDER BY category, name
    `)

    return NextResponse.json(vendorsResult.rows)
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

    const result = await client.execute({
      sql: `INSERT INTO vendors (category, name, contact_name, email, phone, website, contract_url, total_cost, paid, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        category, name, contactName || null, email || null, phone || null,
        website || null, contractUrl || null, totalCost || 0, paid || 0, notes || null
      ]
    })

    const vendorResult = await client.execute({
      sql: 'SELECT * FROM vendors WHERE id = ?',
      args: [result.lastInsertRowid ? Number(result.lastInsertRowid) : 0]
    })
    return NextResponse.json(vendorResult.rows[0], { status: 201 })
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

    await client.execute({
      sql: `UPDATE vendors SET category = ?, name = ?, contact_name = ?, email = ?, phone = ?, website = ?, contract_url = ?, total_cost = ?, paid = ?, notes = ? WHERE id = ?`,
      args: [
        category, name, contactName || null, email || null, phone || null,
        website || null, contractUrl || null, totalCost || 0, paid || 0, notes || null, id
      ]
    })

    const vendorResult = await client.execute({
      sql: 'SELECT * FROM vendors WHERE id = ?',
      args: [id]
    })
    return NextResponse.json(vendorResult.rows[0])
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

    await client.execute({ sql: 'DELETE FROM vendors WHERE id = ?', args: [id] })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting vendor:', error)
    return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 })
  }
}
