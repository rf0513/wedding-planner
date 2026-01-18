"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface WeddingEvent {
  id: number
  name: string
  date: string
  start_time: string | null
  end_time: string | null
  venue: string | null
}

interface Task {
  id: number
  title: string
  due_date: string | null
  priority: string
  completed: number
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2027, 1, 1)) // February 2027
  const [events, setEvents] = useState<WeddingEvent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [eventsRes, tasksRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/tasks")
      ])
      const eventsData = await eventsRes.json()
      const tasksData = await tasksRes.json()

      setEvents(eventsData || [])
      setTasks(tasksData || [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (number | null)[] = []

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }

  const getTasksForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return tasks.filter(t => t.due_date === dateStr && !t.completed)
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
    setSelectedDate(null)
  }

  const goToWeddingMonth = () => {
    setCurrentDate(new Date(2027, 1, 1)) // February 2027
    setSelectedDate(null)
  }

  const days = getDaysInMonth(currentDate)
  const selectedDateEvents = selectedDate
    ? events.filter(e => e.date === selectedDate)
    : []
  const selectedDateTasks = selectedDate
    ? tasks.filter(t => t.due_date === selectedDate)
    : []

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
              Calendar
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              View your wedding timeline and important dates
            </p>
          </div>
          <Button variant="outline" onClick={goToWeddingMonth}>
            <CalendarIcon className="w-4 h-4 mr-2" />
            Go to Wedding Month
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <CardTitle>
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-[var(--muted-foreground)] py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="aspect-square" />
                  }

                  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const dayEvents = getEventsForDate(day)
                  const dayTasks = getTasksForDate(day)
                  const isSelected = selectedDate === dateStr
                  const hasItems = dayEvents.length > 0 || dayTasks.length > 0

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`aspect-square p-1 rounded-lg text-sm transition-colors ${
                        isSelected
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : hasItems
                          ? "bg-[var(--muted)] hover:bg-[var(--primary)]/20"
                          : "hover:bg-[var(--muted)]"
                      }`}
                    >
                      <div className="font-medium">{day}</div>
                      {dayEvents.length > 0 && (
                        <div className="flex justify-center gap-0.5 mt-1">
                          {dayEvents.slice(0, 3).map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                          ))}
                        </div>
                      )}
                      {dayTasks.length > 0 && !dayEvents.length && (
                        <div className="flex justify-center gap-0.5 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? formatDate(selectedDate) : "Select a Date"}
              </CardTitle>
              <CardDescription>
                {selectedDate
                  ? `${selectedDateEvents.length} event${selectedDateEvents.length !== 1 ? 's' : ''}, ${selectedDateTasks.length} task${selectedDateTasks.length !== 1 ? 's' : ''}`
                  : "Click on a date to see details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedDate ? (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
                  Select a date to view events and tasks
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Events */}
                  {selectedDateEvents.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-sm">Wedding Events</h4>
                      <div className="space-y-2">
                        {selectedDateEvents.map(event => (
                          <div key={event.id} className="p-3 rounded-lg bg-[var(--primary)]/10 border-l-4 border-[var(--primary)]">
                            <div className="font-medium">{event.name}</div>
                            {event.start_time && (
                              <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] mt-1">
                                <Clock className="w-3 h-3" />
                                {event.start_time}
                                {event.end_time && ` - ${event.end_time}`}
                              </div>
                            )}
                            {event.venue && (
                              <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                                <MapPin className="w-3 h-3" />
                                {event.venue}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tasks */}
                  {selectedDateTasks.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-sm">Tasks Due</h4>
                      <div className="space-y-2">
                        {selectedDateTasks.map(task => (
                          <div key={task.id} className="p-3 rounded-lg bg-[var(--muted)]">
                            <div className="flex items-center gap-2">
                              <span className={task.completed ? "line-through" : ""}>
                                {task.title}
                              </span>
                              <Badge
                                variant={
                                  task.priority === "high"
                                    ? "destructive"
                                    : task.priority === "medium"
                                    ? "warning"
                                    : "secondary"
                                }
                              >
                                {task.priority}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDateEvents.length === 0 && selectedDateTasks.length === 0 && (
                    <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                      No events or tasks for this date
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Wedding Week Overview</CardTitle>
            <CardDescription>February 2-6, 2027</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
              {events.slice(0, 5).map((event, i) => (
                <div
                  key={event.id}
                  className="p-4 rounded-lg border text-center"
                >
                  <Badge variant="outline" className="mb-2">Day {i + 1}</Badge>
                  <div className="font-medium">{event.name}</div>
                  <div className="text-sm text-[var(--muted-foreground)]">
                    {formatDate(event.date)}
                  </div>
                  {event.start_time && (
                    <div className="text-xs text-[var(--muted-foreground)] mt-1">
                      {event.start_time}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
