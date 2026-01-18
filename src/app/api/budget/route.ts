import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'

const sqlite = new Database('wedding.db')

export async function GET() {
  try {
    const categories = sqlite.prepare(`
      SELECT bc.*,
        COALESCE(SUM(bi.planned), 0) as total_planned,
        COALESCE(SUM(bi.actual), 0) as total_actual,
        COALESCE(SUM(bi.paid), 0) as total_paid
      FROM budget_categories bc
      LEFT JOIN budget_items bi ON bc.id = bi.category_id
      GROUP BY bc.id
      ORDER BY bc."order" ASC
    `).all()

    const items = sqlite.prepare(`
      SELECT * FROM budget_items ORDER BY id ASC
    `).all()

    return NextResponse.json({ categories, items })
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
      const result = sqlite.prepare(`
        INSERT INTO budget_categories (name, event_id, planned_amount, "order")
        VALUES (?, ?, ?, ?)
      `).run(data.name, data.eventId || null, data.plannedAmount || 0, data.order || 0)

      const category = sqlite.prepare('SELECT * FROM budget_categories WHERE id = ?').get(result.lastInsertRowid)
      return NextResponse.json(category, { status: 201 })
    } else {
      const result = sqlite.prepare(`
        INSERT INTO budget_items (category_id, name, vendor, planned, actual, paid, due_date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        data.categoryId,
        data.name,
        data.vendor || null,
        data.planned || 0,
        data.actual || 0,
        data.paid || 0,
        data.dueDate || null,
        data.notes || null
      )

      const item = sqlite.prepare('SELECT * FROM budget_items WHERE id = ?').get(result.lastInsertRowid)
      return NextResponse.json(item, { status: 201 })
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
        sqlite.prepare(`
          UPDATE budget_categories
          SET planned_amount = ?
          WHERE id = ?
        `).run(data.plannedAmount, id)
      } else {
        // Full update
        sqlite.prepare(`
          UPDATE budget_categories
          SET name = ?, event_id = ?, planned_amount = ?, "order" = ?
          WHERE id = ?
        `).run(data.name, data.eventId || null, data.plannedAmount || 0, data.order || 0, id)
      }

      const category = sqlite.prepare('SELECT * FROM budget_categories WHERE id = ?').get(id)
      return NextResponse.json(category)
    } else {
      sqlite.prepare(`
        UPDATE budget_items
        SET category_id = ?, name = ?, vendor = ?, planned = ?, actual = ?, paid = ?, due_date = ?, notes = ?
        WHERE id = ?
      `).run(
        data.categoryId,
        data.name,
        data.vendor || null,
        data.planned || 0,
        data.actual || 0,
        data.paid || 0,
        data.dueDate || null,
        data.notes || null,
        id
      )

      const item = sqlite.prepare('SELECT * FROM budget_items WHERE id = ?').get(id)
      return NextResponse.json(item)
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
      sqlite.prepare('DELETE FROM budget_items WHERE category_id = ?').run(id)
      sqlite.prepare('DELETE FROM budget_categories WHERE id = ?').run(id)
    } else {
      sqlite.prepare('DELETE FROM budget_items WHERE id = ?').run(id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting budget entry:', error)
    return NextResponse.json({ error: 'Failed to delete budget entry' }, { status: 500 })
  }
}
