import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/db'

export async function GET() {
  try {
    const tasksResult = await client.execute(`
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
    `)

    return NextResponse.json(tasksResult.rows)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, dueDate, priority, category, assignedTo } = body

    const result = await client.execute({
      sql: `INSERT INTO tasks (title, description, due_date, priority, category, assigned_to, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [title, description || null, dueDate || null, priority || 'medium', category || null, assignedTo || null]
    })

    const taskResult = await client.execute({
      sql: 'SELECT * FROM tasks WHERE id = ?',
      args: [result.lastInsertRowid ? Number(result.lastInsertRowid) : 0]
    })

    return NextResponse.json(taskResult.rows[0], { status: 201 })
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
      await client.execute({
        sql: `UPDATE tasks SET completed = ?, completed_at = CASE WHEN ? = 1 THEN datetime('now') ELSE NULL END WHERE id = ?`,
        args: [completed ? 1 : 0, completed ? 1 : 0, id]
      })
    } else {
      await client.execute({
        sql: `UPDATE tasks SET title = ?, description = ?, due_date = ?, priority = ?, category = ?, assigned_to = ? WHERE id = ?`,
        args: [title, description || null, dueDate || null, priority || 'medium', category || null, assignedTo || null, id]
      })
    }

    const taskResult = await client.execute({
      sql: 'SELECT * FROM tasks WHERE id = ?',
      args: [id]
    })
    return NextResponse.json(taskResult.rows[0])
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

    await client.execute({ sql: 'DELETE FROM tasks WHERE id = ?', args: [id] })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
