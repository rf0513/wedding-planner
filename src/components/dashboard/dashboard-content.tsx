"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { getTimeUntilWedding, formatCurrency } from "@/lib/utils"
import {
  CalendarDays,
  DollarSign,
  Users,
  CheckSquare,
  Calendar,
  TrendingUp,
  Store
} from "lucide-react"

const WEDDING_DATE = new Date("2027-02-02T00:00:00")

interface DashboardStats {
  totalBudget: number
  spentBudget: number
  totalGuests: number
  confirmedGuests: number
  totalTasks: number
  completedTasks: number
  upcomingEvents: { name: string; date: string; daysUntil: number }[]
  recentActivity: { action: string; item: string; time: string }[]
}

export function DashboardContent() {
  const [countdown, setCountdown] = useState(getTimeUntilWedding(WEDDING_DATE))
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    // Update countdown every second
    const timer = setInterval(() => {
      setCountdown(getTimeUntilWedding(WEDDING_DATE))
    }, 1000)

    // Fetch dashboard stats
    fetchStats()

    return () => clearInterval(timer)
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const budgetProgress = stats ? (stats.spentBudget / stats.totalBudget) * 100 : 0
  const guestProgress = stats ? (stats.confirmedGuests / stats.totalGuests) * 100 : 0
  const taskProgress = stats ? (stats.completedTasks / stats.totalTasks) * 100 : 0

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
          Wedding Dashboard
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Your Indo-Western wedding celebration in Mumbai
        </p>
      </div>

      {/* Countdown */}
      <Card className="overflow-hidden">
        <div className="bg-[var(--primary)] p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-6 h-6" />
            <span className="font-medium">Countdown to Event Date</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-center">
            <div>
              <div className="text-2xl sm:text-4xl md:text-5xl font-bold">{countdown.days}</div>
              <div className="text-sm opacity-80">Days</div>
            </div>
            <div>
              <div className="text-2xl sm:text-4xl md:text-5xl font-bold">{countdown.hours}</div>
              <div className="text-sm opacity-80">Hours</div>
            </div>
            <div>
              <div className="text-2xl sm:text-4xl md:text-5xl font-bold">{countdown.minutes}</div>
              <div className="text-sm opacity-80">Minutes</div>
            </div>
            <div>
              <div className="text-2xl sm:text-4xl md:text-5xl font-bold">{countdown.seconds}</div>
              <div className="text-sm opacity-80">Seconds</div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm opacity-80">
            February 2-4, 2027 - Mumbai, India
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-[var(--muted-foreground)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatCurrency(stats.spentBudget) : "---"}
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">
              of {stats ? formatCurrency(stats.totalBudget) : "---"} total
            </p>
            <Progress value={budgetProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guests</CardTitle>
            <Users className="h-4 w-4 text-[var(--muted-foreground)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.confirmedGuests : "0"}
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">
              of {stats ? stats.totalGuests : "0"} confirmed
            </p>
            <Progress value={guestProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-[var(--muted-foreground)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.completedTasks : "0"}
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">
              of {stats ? stats.totalTasks : "0"} completed
            </p>
            <Progress value={taskProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Left</CardTitle>
            <CalendarDays className="h-4 w-4 text-[var(--muted-foreground)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countdown.days}</div>
            <p className="text-xs text-[var(--muted-foreground)]">
              until the celebration begins
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs text-[var(--success)]">
              <TrendingUp className="w-3 h-3" />
              On track
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events and Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Wedding Events</CardTitle>
            <CardDescription>Your 3-day celebration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Mehendi", date: "Feb 2", time: "", color: "bg-slate-400", day: 1 },
                { name: "Haldi", date: "Feb 3", time: "Morning", color: "bg-slate-500", day: 2 },
                { name: "Vows & Sangeet", date: "Feb 3", time: "Evening", color: "bg-slate-400", day: 2 },
                { name: "Wedding Ceremony", date: "Feb 4", time: "Morning", color: "bg-slate-500", day: 3 },
                { name: "Reception", date: "Feb 4", time: "Evening", color: "bg-slate-400", day: 3 },
              ].map((event, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-sm ${event.color}`} />
                  <div className="flex-1">
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {event.date}, 2027{event.time && ` - ${event.time}`}
                    </p>
                  </div>
                  <Badge variant="outline">Day {event.day}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks at your fingertips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/guests"
                className="p-4 rounded border hover:bg-[var(--muted)] transition-colors text-center"
              >
                <Users className="w-6 h-6 mx-auto mb-2 text-[var(--primary)]" />
                <span className="text-sm font-medium">Add Guest</span>
              </a>
              <a
                href="/todos"
                className="p-4 rounded border hover:bg-[var(--muted)] transition-colors text-center"
              >
                <CheckSquare className="w-6 h-6 mx-auto mb-2 text-[var(--primary)]" />
                <span className="text-sm font-medium">Add Task</span>
              </a>
              <a
                href="/budget"
                className="p-4 rounded border hover:bg-[var(--muted)] transition-colors text-center"
              >
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-[var(--primary)]" />
                <span className="text-sm font-medium">Log Expense</span>
              </a>
              <a
                href="/vendors"
                className="p-4 rounded border hover:bg-[var(--muted)] transition-colors text-center"
              >
                <Store className="w-6 h-6 mx-auto mb-2 text-[var(--primary)]" />
                <span className="text-sm font-medium">Add Vendor</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
