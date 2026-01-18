"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Calendar, MapPin, Clock, Users } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface WeddingEvent {
  id: number
  name: string
  date: string
  start_time: string | null
  end_time: string | null
  venue: string | null
  description: string | null
  order: number
  total_guests: number
  confirmed_guests: number
}

const eventColors: Record<string, string> = {
  "Mehendi": "bg-green-500",
  "Sangeet": "bg-purple-500",
  "Haldi": "bg-yellow-500",
  "Wedding Ceremony": "bg-red-500",
  "Reception": "bg-blue-500"
}

export default function EventsPage() {
  const [events, setEvents] = useState<WeddingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<WeddingEvent | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    description: "",
    order: 0
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events")
      const data = await res.json()
      setEvents(data || [])
    } catch (error) {
      console.error("Failed to fetch events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const method = editingEvent ? "PUT" : "POST"
    const body = {
      id: editingEvent?.id,
      ...formData
    }

    try {
      await fetch("/api/events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      fetchEvents()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to save event:", error)
    }
  }

  const deleteEvent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this event? This will also remove all associated guest RSVPs and itinerary items.")) return

    try {
      await fetch(`/api/events?id=${id}`, { method: "DELETE" })
      fetchEvents()
    } catch (error) {
      console.error("Failed to delete event:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      date: "",
      startTime: "",
      endTime: "",
      venue: "",
      description: "",
      order: events.length
    })
    setEditingEvent(null)
  }

  const openEditDialog = (event: WeddingEvent) => {
    setEditingEvent(event)
    setFormData({
      name: event.name,
      date: event.date,
      startTime: event.start_time || "",
      endTime: event.end_time || "",
      venue: event.venue || "",
      description: event.description || "",
      order: event.order
    })
    setDialogOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
              Wedding Events
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              Manage your multi-day wedding celebration
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
                  <DialogDescription>
                    Add or edit a wedding celebration event
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Event Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Mehendi, Sangeet, Wedding Ceremony"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="order">Order</Label>
                      <Input
                        id="order"
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                      id="venue"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      placeholder="Venue name and address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Event details, dress code, etc."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingEvent ? "Update" : "Add"} Event
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[var(--border)]" />
          <div className="space-y-6">
            {loading ? (
              <p className="text-center py-8 text-[var(--muted-foreground)]">Loading events...</p>
            ) : events.length === 0 ? (
              <p className="text-center py-8 text-[var(--muted-foreground)]">
                No events added yet.
              </p>
            ) : (
              events.map((event, index) => (
                <div key={event.id} className="relative pl-16">
                  <div
                    className={`absolute left-4 w-5 h-5 rounded-full border-4 border-[var(--background)] ${
                      eventColors[event.name] || "bg-[var(--primary)]"
                    }`}
                  />
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle>{event.name}</CardTitle>
                            <Badge variant="outline">Day {index + 1}</Badge>
                          </div>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(event.date)}
                            </span>
                            {event.start_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {event.start_time}
                                {event.end_time && ` - ${event.end_time}`}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(event)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteEvent(event.id)}
                            className="text-[var(--destructive)]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {event.venue && (
                        <p className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-2">
                          <MapPin className="w-4 h-4" />
                          {event.venue}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-sm text-[var(--muted-foreground)] mb-4">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.confirmed_guests} confirmed / {event.total_guests} invited
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
