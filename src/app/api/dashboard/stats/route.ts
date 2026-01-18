import { NextResponse } from 'next/server'
import Database from 'better-sqlite3'

const sqlite = new Database('wedding.db')

const TOTAL_BUDGET = 80000

export async function GET() {
  try {
    // Get budget stats - spent is the sum of actual expenses
    const budgetStats = sqlite.prepare(`
      SELECT
        COALESCE(SUM(actual), 0) as spentBudget
      FROM budget_items
    `).get() as { spentBudget: number }

    // Get guest stats
    const guestStats = sqlite.prepare(`
      SELECT COUNT(*) as totalGuests FROM guests
    `).get() as { totalGuests: number }

    const confirmedGuests = sqlite.prepare(`
      SELECT COUNT(DISTINCT g.id) as confirmed
      FROM guests g
      JOIN guest_events ge ON g.id = ge.guest_id
      WHERE ge.rsvp_status = 'confirmed'
    `).get() as { confirmed: number }

    // Get task stats
    const taskStats = sqlite.prepare(`
      SELECT
        COUNT(*) as totalTasks,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completedTasks
      FROM tasks
    `).get() as { totalTasks: number; completedTasks: number }

    // Get upcoming events
    const upcomingEvents = sqlite.prepare(`
      SELECT name, date FROM wedding_events ORDER BY "order" ASC LIMIT 5
    `).all() as { name: string; date: string }[]

    return NextResponse.json({
      totalBudget: TOTAL_BUDGET,
      spentBudget: budgetStats.spentBudget || 0,
      totalGuests: guestStats.totalGuests || 0,
      confirmedGuests: confirmedGuests.confirmed || 0,
      totalTasks: taskStats.totalTasks || 0,
      completedTasks: taskStats.completedTasks || 0,
      upcomingEvents: upcomingEvents.map(e => ({
        ...e,
        daysUntil: Math.ceil((new Date(e.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      })),
      recentActivity: []
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({
      totalBudget: TOTAL_BUDGET,
      spentBudget: 0,
      totalGuests: 0,
      confirmedGuests: 0,
      totalTasks: 0,
      completedTasks: 0,
      upcomingEvents: [],
      recentActivity: []
    })
  }
}
