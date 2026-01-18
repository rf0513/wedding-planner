import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'

const sqlite = new Database('wedding.db')

export async function GET() {
  try {
    const tasks = sqlite.prepare(`
      SELECT t.*, u.name as assigned_to_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      ORDER BY
        CASE WHEN t.completed = 1 THEN 1 ELSE 0 END,
        CASE t.priority
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END,
        t.due_date ASC NULLS LAST
    `).all()

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, dueDate, priority, category, assignedTo } = body

    const result = sqlite.prepare(`
      INSERT INTO tasks (title, description, due_date, priority, category, assigned_to, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(title, description || null, dueDate || null, priority || 'medium', category || null, assignedTo || null)

    const task = sqlite.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid)

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, description, dueDate, priority, category, assignedTo, completed } = body

    if (completed !== undefined) {
      sqlite.prepare(`
        UPDATE tasks
        SET completed = ?, completed_at = CASE WHEN ? = 1 THEN datetime('now') ELSE NULL END
        WHERE id = ?
      `).run(completed ? 1 : 0, completed ? 1 : 0, id)
    } else {
      sqlite.prepare(`
        UPDATE tasks
        SET title = ?, description = ?, due_date = ?, priority = ?, category = ?, assigned_to = ?
        WHERE id = ?
      `).run(title, description || null, dueDate || null, priority || 'medium', category || null, assignedTo || null, id)
    }

    const task = sqlite.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
    }

    sqlite.prepare('DELETE FROM tasks WHERE id = ?').run(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
