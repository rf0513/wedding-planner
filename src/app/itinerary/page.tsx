"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Clock, MapPin, Users } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface ItineraryItem {
  id: number
  event_id: number
  event_name: string
  event_date: string
  time: string
  title: string
  location: string | null
  people: string | null
  notes: string | null
  order: number
}

interface WeddingEvent {
  id: number
  name: string
  date: string
}

export default function ItineraryPage() {
  const [items, setItems] = useState<ItineraryItem[]>([])
  const [events, setEvents] = useState<WeddingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null)
  const [activeEvent, setActiveEvent] = useState<string>("all")

  const [formData, setFormData] = useState({
    eventId: "",
    time: "",
    title: "",
    location: "",
    people: "",
    notes: "",
    order: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [itemsRes, eventsRes] = await Promise.all([
        fetch("/api/itinerary"),
        fetch("/api/events")
      ])
      const itemsData = await itemsRes.json()
      const eventsData = await eventsRes.json()

      setItems(itemsData || [])
      setEvents(eventsData || [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const method = editingItem ? "PUT" : "POST"
    const body = {
      id: editingItem?.id,
      ...formData,
      eventId: parseInt(formData.eventId)
    }

    try {
      await fetch("/api/itinerary", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      fetchData()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to save item:", error)
    }
  }

  const deleteItem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      await fetch(`/api/itinerary?id=${id}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("Failed to delete item:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      eventId: "",
      time: "",
      title: "",
      location: "",
      people: "",
      notes: "",
      order: 0
    })
    setEditingItem(null)
  }

  const openEditDialog = (item: ItineraryItem) => {
    setEditingItem(item)
    setFormData({
      eventId: String(item.event_id),
      time: item.time,
      title: item.title,
      location: item.location || "",
      people: item.people || "",
      notes: item.notes || "",
      order: item.order
    })
    setDialogOpen(true)
  }

  const groupedItems = events.map(event => ({
    ...event,
    items: items.filter(i => i.event_id === event.id).sort((a, b) => {
      if (a.time < b.time) return -1
      if (a.time > b.time) return 1
      return a.order - b.order
    })
  }))

  const filteredGroups = activeEvent === "all"
    ? groupedItems
    : groupedItems.filter(g => String(g.id) === activeEvent)

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
              Day-of Itineraries
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              Detailed schedules for each wedding event
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Edit Item" : "Add Itinerary Item"}</DialogTitle>
                  <DialogDescription>
                    Add a schedule item for your wedding day
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventId">Event *</Label>
                    <Select
                      value={formData.eventId}
                      onValueChange={(value) => setFormData({ ...formData, eventId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((e) => (
                          <SelectItem key={e.id} value={String(e.id)}>
                            {e.name} ({formatDate(e.date)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="time">Time *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Bride arrives for makeup"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Where does this happen?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="people">People Involved</Label>
                    <Input
                      id="people"
                      value={formData.people}
                      onChange={(e) => setFormData({ ...formData, people: e.target.value })}
                      placeholder="Who needs to be there?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional details"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={!formData.eventId || !formData.time || !formData.title}>
                    {editingItem ? "Update" : "Add"} Item
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Event Filter */}
        <Tabs value={activeEvent} onValueChange={setActiveEvent}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all">All Days</TabsTrigger>
            {events.map((event) => (
              <TabsTrigger key={event.id} value={String(event.id)}>
                {event.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeEvent} className="mt-6">
            {loading ? (
              <p className="text-center py-8 text-[var(--muted-foreground)]">Loading...</p>
            ) : filteredGroups.length === 0 || filteredGroups.every(g => g.items.length === 0) ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-[var(--muted-foreground)] opacity-50" />
                  <p className="text-[var(--muted-foreground)]">
                    No itinerary items yet. Start planning your schedule!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {filteredGroups.filter(g => g.items.length > 0).map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{event.name}</CardTitle>
                          <CardDescription>{formatDate(event.date)}</CardDescription>
                        </div>
                        <Badge variant="outline">{event.items.length} items</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[var(--border)]" />
                        <div className="space-y-4">
                          {event.items.map((item, index) => (
                            <div key={item.id} className="relative pl-16 group">
                              <div className="absolute left-4 w-5 h-5 rounded-full bg-[var(--primary)] border-4 border-[var(--background)]" />
                              <div className="p-4 rounded-lg border bg-[var(--card)] hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                      <Badge variant="secondary">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {item.time}
                                      </Badge>
                                      <span className="font-medium">{item.title}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-[var(--muted-foreground)]">
                                      {item.location && (
                                        <span className="flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          {item.location}
                                        </span>
                                      )}
                                      {item.people && (
                                        <span className="flex items-center gap-1">
                                          <Users className="w-3 h-3" />
                                          {item.people}
                                        </span>
                                      )}
                                    </div>
                                    {item.notes && (
                                      <p className="text-sm text-[var(--muted-foreground)] mt-2">
                                        {item.notes}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => deleteItem(item.id)}
                                      className="text-[var(--destructive)]"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
