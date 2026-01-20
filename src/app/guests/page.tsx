"use client"

import { useEffect, useState, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Edit, Search, Users, UserCheck, UserX, Mail, Phone, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react"
import { ExportPdfButton } from "@/components/export-pdf-button"

interface Guest {
  id: number
  first_name: string
  last_name: string | null
  email: string | null
  phone: string | null
  group: string | null
  meal_preference: string | null
  dietary_restrictions: string | null
  table_id: number | null
  table_name: string | null
  notes: string | null
}

interface GuestEvent {
  id: number
  guest_id: number
  event_id: number
  event_name: string
  rsvp_status: string
  meal_choice: string | null
}

interface WeddingEvent {
  id: number
  name: string
  date: string
}

const guestGroups = ["Family", "Friends", "Work", "School", "Neighbors", "Other"]
const mealPreferences = ["Vegetarian", "Non-Vegetarian", "Vegan", "Jain"]

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [guestEvents, setGuestEvents] = useState<GuestEvent[]>([])
  const [events, setEvents] = useState<WeddingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterGroup, setFilterGroup] = useState<string>("all")
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    imported: number
    skipped: number
    errors: string[]
    totalErrors: number
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    group: "",
    mealPreference: "",
    dietaryRestrictions: "",
    notes: "",
    eventIds: [] as number[]
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [guestsRes, eventsRes] = await Promise.all([
        fetch("/api/guests"),
        fetch("/api/events")
      ])
      const guestsData = await guestsRes.json()
      const eventsData = await eventsRes.json()

      setGuests(guestsData.guests || [])
      setGuestEvents(guestsData.guestEvents || [])
      setEvents(eventsData || [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const method = editingGuest ? "PUT" : "POST"
    const body = {
      id: editingGuest?.id,
      ...formData
    }

    try {
      await fetch("/api/guests", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      fetchData()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to save guest:", error)
    }
  }

  const deleteGuest = async (id: number) => {
    if (!confirm("Are you sure you want to delete this guest?")) return

    try {
      await fetch(`/api/guests?id=${id}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("Failed to delete guest:", error)
    }
  }

  const updateRsvp = async (guestId: number, eventId: number, status: string) => {
    try {
      await fetch("/api/guests/rsvp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId, eventId, rsvpStatus: status })
      })
      fetchData()
    } catch (error) {
      console.error("Failed to update RSVP:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      group: "",
      mealPreference: "",
      dietaryRestrictions: "",
      notes: "",
      eventIds: events.map(e => e.id)
    })
    setEditingGuest(null)
  }

  const openEditDialog = (guest: Guest) => {
    const guestEventIds = guestEvents
      .filter(ge => ge.guest_id === guest.id)
      .map(ge => ge.event_id)

    setEditingGuest(guest)
    setFormData({
      firstName: guest.first_name,
      lastName: guest.last_name || "",
      email: guest.email || "",
      phone: guest.phone || "",
      group: guest.group || "",
      mealPreference: guest.meal_preference || "",
      dietaryRestrictions: guest.dietary_restrictions || "",
      notes: guest.notes || "",
      eventIds: guestEventIds
    })
    setDialogOpen(true)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)

    const uploadData = new FormData()
    uploadData.append('file', file)

    try {
      const res = await fetch('/api/guests/import', {
        method: 'POST',
        body: uploadData
      })
      const result = await res.json()
      setImportResult(result)

      if (result.success && result.imported > 0) {
        fetchData()
      }
    } catch (error) {
      setImportResult({
        success: false,
        imported: 0,
        skipped: 0,
        errors: ['Failed to import file'],
        totalErrors: 1
      })
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleExport = () => {
    window.location.href = '/api/guests/export'
  }

  const filteredGuests = guests.filter(guest => {
    const matchesSearch =
      guest.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (guest.last_name && guest.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesGroup = filterGroup === "all" || guest.group === filterGroup
    return matchesSearch && matchesGroup
  })

  const getGuestRsvp = (guestId: number, eventId: number) => {
    return guestEvents.find(ge => ge.guest_id === guestId && ge.event_id === eventId)
  }

  const stats = {
    total: guests.length,
    confirmed: guestEvents.filter(ge => ge.rsvp_status === "confirmed").length,
    declined: guestEvents.filter(ge => ge.rsvp_status === "declined").length,
    pending: guestEvents.filter(ge => ge.rsvp_status === "pending").length
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
              Guest Management
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              Manage your wedding guest list and RSVPs
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* Hidden file input for import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".csv,.xlsx,.xls"
              className="hidden"
            />

            {/* Export PDF Button */}
            <ExportPdfButton title="Export PDF" />

            {/* Import Button */}
            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5" />
                    Import Guests from Spreadsheet
                  </DialogTitle>
                  <DialogDescription>
                    Upload a CSV file exported from Google Sheets, Excel, or similar.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="p-4 bg-[var(--muted)] rounded-lg">
                    <h4 className="font-medium mb-2">Required Column</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge>first_name</Badge>
                      <span className="text-[var(--muted-foreground)]">- Guest's first name (required)</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Optional Columns</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">last_name</Badge>
                        <span className="text-[var(--muted-foreground)]">Last name</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">email</Badge>
                        <span className="text-[var(--muted-foreground)]">Email address</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">phone</Badge>
                        <span className="text-[var(--muted-foreground)]">Phone number</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">group</Badge>
                        <span className="text-[var(--muted-foreground)]">Family, Friends, etc.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">meal_preference</Badge>
                        <span className="text-[var(--muted-foreground)]">Meal choice</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">dietary_restrictions</Badge>
                        <span className="text-[var(--muted-foreground)]">Allergies, etc.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">notes</Badge>
                        <span className="text-[var(--muted-foreground)]">Additional notes</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-[var(--secondary)] bg-[var(--secondary)]/10 rounded-lg">
                    <h4 className="font-medium mb-2">Event Columns (use TRUE/FALSE)</h4>
                    <p className="text-sm text-[var(--muted-foreground)] mb-2">
                      Add columns for each event to specify which guests are invited. Use TRUE, YES, 1, or X to invite.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">mehendi</Badge>
                      <Badge variant="secondary">haldi</Badge>
                      <Badge variant="secondary">vows_&_sangeet</Badge>
                      <Badge variant="secondary">wedding_ceremony</Badge>
                      <Badge variant="secondary">reception</Badge>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-2">
                      If no event columns are included, guests will be invited to all events.
                    </p>
                  </div>

                  <div className="p-4 border border-[var(--primary)] bg-[var(--primary)]/5 rounded-lg">
                    <h4 className="font-medium mb-1 text-[var(--primary)]">Deduplication</h4>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Guests with matching names (first + last) or email addresses will be skipped to avoid duplicates.
                    </p>
                  </div>

                  {importResult && (
                    <div className={`p-4 rounded-lg ${importResult.success ? 'bg-[var(--success)]/10 border border-[var(--success)]' : 'bg-[var(--destructive)]/10 border border-[var(--destructive)]'}`}>
                      <div className="flex items-start gap-2">
                        {importResult.success ? (
                          <CheckCircle className="w-5 h-5 text-[var(--success)] mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-[var(--destructive)] mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium">
                            {importResult.success ? 'Import Complete' : 'Import Failed'}
                          </p>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {importResult.imported} imported, {importResult.skipped} skipped (duplicates)
                            {importResult.totalErrors > 0 && `, ${importResult.totalErrors} errors`}
                          </p>
                          {importResult.errors.length > 0 && (
                            <ul className="text-sm text-[var(--destructive)] mt-2 list-disc list-inside">
                              {importResult.errors.map((err, i) => (
                                <li key={i}>{err}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importing}
                  >
                    {importing ? (
                      <>Importing...</>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Select CSV File
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Export Button */}
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>

            {/* Add Guest Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) resetForm()
              else if (!editingGuest) {
                setFormData(prev => ({ ...prev, eventIds: events.map(e => e.id) }))
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Guest
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingGuest ? "Edit Guest" : "Add New Guest"}</DialogTitle>
                  <DialogDescription>
                    Add guest information and event attendance
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="group">Group</Label>
                      <Select
                        value={formData.group}
                        onValueChange={(value) => setFormData({ ...formData, group: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                        <SelectContent>
                          {guestGroups.map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meal">Meal Preference</Label>
                      <Select
                        value={formData.mealPreference}
                        onValueChange={(value) => setFormData({ ...formData, mealPreference: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                        <SelectContent>
                          {mealPreferences.map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dietary">Dietary Restrictions</Label>
                    <Input
                      id="dietary"
                      value={formData.dietaryRestrictions}
                      onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                      placeholder="Any allergies or restrictions"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Events Attending</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {events.map((event) => (
                        <div key={event.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`event-${event.id}`}
                            checked={formData.eventIds.includes(event.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({ ...formData, eventIds: [...formData.eventIds, event.id] })
                              } else {
                                setFormData({ ...formData, eventIds: formData.eventIds.filter(id => id !== event.id) })
                              }
                            }}
                          />
                          <Label htmlFor={`event-${event.id}`}>{event.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingGuest ? "Update" : "Add"} Guest
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--primary)]" />
                <span className="text-sm text-[var(--muted-foreground)]">Total Guests</span>
              </div>
              <div className="text-2xl font-bold mt-2">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[var(--success)]" />
                <span className="text-sm text-[var(--muted-foreground)]">Confirmed</span>
              </div>
              <div className="text-2xl font-bold mt-2 text-[var(--success)]">{stats.confirmed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <UserX className="w-5 h-5 text-[var(--destructive)]" />
                <span className="text-sm text-[var(--muted-foreground)]">Declined</span>
              </div>
              <div className="text-2xl font-bold mt-2 text-[var(--destructive)]">{stats.declined}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-[var(--muted-foreground)]">Pending</div>
              <div className="text-2xl font-bold mt-2 text-[var(--warning)]">{stats.pending}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterGroup} onValueChange={setFilterGroup}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {guestGroups.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Guest List */}
        <Card>
          <CardHeader>
            <CardTitle>Guest List</CardTitle>
            <CardDescription>
              {filteredGuests.length} guest{filteredGuests.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-[var(--muted-foreground)]">Loading...</p>
            ) : filteredGuests.length === 0 ? (
              <p className="text-center py-8 text-[var(--muted-foreground)]">
                No guests found. Add your first guest to get started!
              </p>
            ) : (
              <div className="space-y-4">
                {filteredGuests.map((guest) => (
                  <div
                    key={guest.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border hover:bg-[var(--muted)] transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {guest.first_name} {guest.last_name}
                        </span>
                        {guest.group && <Badge variant="outline">{guest.group}</Badge>}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-[var(--muted-foreground)]">
                        {guest.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {guest.email}
                          </span>
                        )}
                        {guest.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {guest.phone}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {events.map((event) => {
                          const rsvp = getGuestRsvp(guest.id, event.id)
                          if (!rsvp) return null
                          return (
                            <Select
                              key={event.id}
                              value={rsvp.rsvp_status}
                              onValueChange={(value) => updateRsvp(guest.id, event.id, value)}
                            >
                              <SelectTrigger className="w-auto h-7 text-xs">
                                <span className="mr-1">{event.name}:</span>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="declined">Declined</SelectItem>
                              </SelectContent>
                            </Select>
                          )
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(guest)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteGuest(guest.id)}
                        className="text-[var(--destructive)]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
