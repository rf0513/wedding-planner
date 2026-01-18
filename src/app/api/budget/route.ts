import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/db'

export async function GET() {
  try {
    const categoriesResult = await client.execute(`
      SELECT bc.*,
        COALESCE(SUM(bi.planned), 0) as total_planned,
        COALESCE(SUM(bi.actual), 0) as total_actual,
        COALESCE(SUM(bi.paid), 0) as total_paid
      FROM budget_categories bc
      LEFT JOIN budget_items bi ON bc.id = bi.category_id
      GROUP BY bc.id
      ORDER BY bc."order" ASC
    `)

    const itemsResult = await client.execute(`
      SELECT * FROM budget_items ORDER BY id ASC
    `)

    return NextResponse.json({ categories: categoriesResult.rows, items: itemsResult.rows })
  } catch (error) {
    console.error('Error fetching budget:', error)
    return NextResponse.json({ categories: [], items: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...data } = body

    if (type === 'category') {
      const result = await client.execute({
        sql: `INSERT INTO budget_categories (name, event_id, planned_amount, "order") VALUES (?, ?, ?, ?)`,
        args: [data.name, data.eventId || null, data.plannedAmount || 0, data.order || 0]
      })

      const categoryResult = await client.execute({
        sql: 'SELECT * FROM budget_categories WHERE id = ?',
        args: [result.lastInsertRowid ? Number(result.lastInsertRowid) : 0]
      })

      return NextResponse.json(categoryResult.rows[0], { status: 201 })
    } else {
      const result = await client.execute({
        sql: `INSERT INTO budget_items (category_id, name, vendor, planned, actual, paid, due_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          data.categoryId,
          data.name,
          data.vendor || null,
          data.planned || 0,
          data.actual || 0,
          data.paid || 0,
          data.dueDate || null,
          data.notes || null
        ]
      })

      const itemResult = await client.execute({
        sql: 'SELECT * FROM budget_items WHERE id = ?',
        args: [result.lastInsertRowid ? Number(result.lastInsertRowid) : 0]
      })
      return NextResponse.json(itemResult.rows[0], { status: 201 })
    }
  } catch (error) {
    console.error('Error creating budget entry:', error)
    return NextResponse.json({ error: 'Failed to create budget entry' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id, ...data } = body

    if (type === 'category') {
      // Support partial updates - only update fields that are provided
      if (data.plannedAmount !== undefined && !data.name) {
        // Just updating the planned amount
        await client.execute({
          sql: `UPDATE budget_categories SET planned_amount = ? WHERE id = ?`,
          args: [data.plannedAmount, id]
        })
      } else {
        // Full update
        await client.execute({
          sql: `UPDATE budget_categories SET name = ?, event_id = ?, planned_amount = ?, "order" = ? WHERE id = ?`,
          args: [data.name, data.eventId || null, data.plannedAmount || 0, data.order || 0, id]
        })
      }

      const categoryResult = await client.execute({
        sql: 'SELECT * FROM budget_categories WHERE id = ?',
        args: [id]
      })
      return NextResponse.json(categoryResult.rows[0])
    } else {
      await client.execute({
        sql: `UPDATE budget_items SET category_id = ?, name = ?, vendor = ?, planned = ?, actual = ?, paid = ?, due_date = ?, notes = ? WHERE id = ?`,
        args: [
          data.categoryId,
          data.name,
          data.vendor || null,
          data.planned || 0,
          data.actual || 0,
          data.paid || 0,
          data.dueDate || null,
          data.notes || null,
          id
        ]
      })

      const itemResult = await client.execute({
        sql: 'SELECT * FROM budget_items WHERE id = ?',
        args: [id]
      })
      return NextResponse.json(itemResult.rows[0])
    }
  } catch (error) {
    console.error('Error updating budget entry:', error)
    return NextResponse.json({ error: 'Failed to update budget entry' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    if (type === 'category') {
      await client.execute({ sql: 'DELETE FROM budget_items WHERE category_id = ?', args: [id] })
      await client.execute({ sql: 'DELETE FROM budget_categories WHERE id = ?', args: [id] })
    } else {
      await client.execute({ sql: 'DELETE FROM budget_items WHERE id = ?', args: [id] })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting budget entry:', error)
    return NextResponse.json({ error: 'Failed to delete budget entry' }, { status: 500 })
  }
}
