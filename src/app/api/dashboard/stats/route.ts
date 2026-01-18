import { NextResponse } from 'next/server'
import { client } from '@/lib/db'

const TOTAL_BUDGET = 80000

export async function GET() {
  try {
    // Get budget stats - spent is the sum of actual expenses
    const budgetStatsResult = await client.execute(`
      SELECT
        COALESCE(SUM(actual), 0) as spentBudget
      FROM budget_items
    `)
    const budgetStats = (budgetStatsResult.rows[0] as unknown as { spentBudget: number }) || { spentBudget: 0 }

    // Get guest stats
    const guestStatsResult = await client.execute(`
      SELECT COUNT(*) as totalGuests FROM guests
    `)
    const guestStats = (guestStatsResult.rows[0] as unknown as { totalGuests: number }) || { totalGuests: 0 }

    const confirmedGuestsResult = await client.execute(`
      SELECT COUNT(DISTINCT g.id) as confirmed
      FROM guests g
      JOIN guest_events ge ON g.id = ge.guest_id
      WHERE ge.rsvp_status = 'confirmed'
    `)
    const confirmedGuests = (confirmedGuestsResult.rows[0] as unknown as { confirmed: number }) || { confirmed: 0 }

    // Get task stats
    const taskStatsResult = await client.execute(`
      SELECT
        COUNT(*) as totalTasks,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completedTasks
      FROM tasks
    `)
    const taskStats = (taskStatsResult.rows[0] as unknown as { totalTasks: number; completedTasks: number }) || { totalTasks: 0, completedTasks: 0 }

    // Get upcoming events
    const upcomingEventsResult = await client.execute(`
      SELECT name, date FROM wedding_events ORDER BY "order" ASC LIMIT 5
    `)
    const upcomingEvents = upcomingEventsResult.rows as unknown as { name: string; date: string }[]

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
