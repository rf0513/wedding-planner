"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Users, Circle } from "lucide-react"

interface Table {
  id: number
  name: string
  capacity: number
  position_x: number
  position_y: number
  seated_count: number
}

interface Guest {
  id: number
  first_name: string
  last_name: string | null
  table_id: number | null
  group: string | null
}

export default function SeatingPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    capacity: "10"
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [tablesRes, guestsRes] = await Promise.all([
        fetch("/api/tables"),
        fetch("/api/guests")
      ])
      const tablesData = await tablesRes.json()
      const guestsData = await guestsRes.json()

      setTables(tablesData || [])
      setGuests(guestsData.guests || [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const method = editingTable ? "PUT" : "POST"
    const body = {
      id: editingTable?.id,
      name: formData.name,
      capacity: parseInt(formData.capacity) || 10
    }

    try {
      await fetch("/api/tables", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      fetchData()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to save table:", error)
    }
  }

  const deleteTable = async (id: number) => {
    if (!confirm("Are you sure you want to delete this table? Guests will be unassigned.")) return

    try {
      await fetch(`/api/tables?id=${id}`, { method: "DELETE" })
      fetchData()
      if (selectedTable?.id === id) setSelectedTable(null)
    } catch (error) {
      console.error("Failed to delete table:", error)
    }
  }

  const assignGuest = async (guestId: number, tableId: number | null) => {
    try {
      const guest = guests.find(g => g.id === guestId)
      if (!guest) return

      await fetch("/api/guests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: guestId,
          firstName: guest.first_name,
          lastName: guest.last_name,
          tableId: tableId
        })
      })
      fetchData()
    } catch (error) {
      console.error("Failed to assign guest:", error)
    }
  }

  const resetForm = () => {
    setFormData({ name: "", capacity: "10" })
    setEditingTable(null)
  }

  const openEditDialog = (table: Table) => {
    setEditingTable(table)
    setFormData({
      name: table.name,
      capacity: String(table.capacity)
    })
    setDialogOpen(true)
  }

  const unassignedGuests = guests.filter(g => !g.table_id)
  const tableGuests = selectedTable
    ? guests.filter(g => g.table_id === selectedTable.id)
    : []

  const totalSeated = tables.reduce((sum, t) => sum + t.seated_count, 0)
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
              Seating Chart
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              Arrange your guest seating
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingTable ? "Edit Table" : "Add New Table"}</DialogTitle>
                  <DialogDescription>
                    Create a table for your seating arrangement
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Table Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Table 1, Family Table, VIP Table"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      min="1"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingTable ? "Update" : "Add"} Table
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-[var(--muted-foreground)]">Tables</div>
              <div className="text-2xl font-bold mt-2">{tables.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-[var(--muted-foreground)]">Guests Seated</div>
              <div className="text-2xl font-bold mt-2">{totalSeated} / {guests.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-[var(--muted-foreground)]">Total Capacity</div>
              <div className="text-2xl font-bold mt-2">{totalCapacity}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Tables Grid */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold">Tables</h2>
            {loading ? (
              <p className="text-center py-8 text-[var(--muted-foreground)]">Loading...</p>
            ) : tables.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-[var(--muted-foreground)]">
                  No tables created yet. Add your first table to start arranging seating.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {tables.map((table) => {
                  const isFull = table.seated_count >= table.capacity
                  const isSelected = selectedTable?.id === table.id

                  return (
                    <Card
                      key={table.id}
                      className={`cursor-pointer transition-all ${
                        isSelected ? "ring-2 ring-[var(--primary)]" : ""
                      }`}
                      onClick={() => setSelectedTable(table)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Circle
                              className={`w-10 h-10 ${
                                isFull ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"
                              }`}
                              fill={isFull ? "currentColor" : "none"}
                            />
                            <div>
                              <div className="font-medium">{table.name}</div>
                              <div className="text-sm text-[var(--muted-foreground)]">
                                {table.seated_count} / {table.capacity} seats
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditDialog(table)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteTable(table.id)
                              }}
                              className="text-[var(--destructive)]"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {guests
                            .filter(g => g.table_id === table.id)
                            .map(g => (
                              <Badge key={g.id} variant="secondary" className="text-xs">
                                {g.first_name}
                              </Badge>
                            ))
                          }
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Guest Assignment Panel */}
          <div className="space-y-4">
            {selectedTable ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedTable.name}</CardTitle>
                  <CardDescription>
                    {tableGuests.length} / {selectedTable.capacity} seats filled
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Seated Guests</h4>
                    {tableGuests.length === 0 ? (
                      <p className="text-sm text-[var(--muted-foreground)]">No guests seated yet</p>
                    ) : (
                      <div className="space-y-2">
                        {tableGuests.map(guest => (
                          <div key={guest.id} className="flex items-center justify-between p-2 rounded bg-[var(--muted)]">
                            <span className="text-sm">
                              {guest.first_name} {guest.last_name}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => assignGuest(guest.id, null)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Add Guest to Table</h4>
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (value) assignGuest(parseInt(value), selectedTable.id)
                      }}
                      disabled={tableGuests.length >= selectedTable.capacity}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a guest" />
                      </SelectTrigger>
                      <SelectContent>
                        {unassignedGuests.map(guest => (
                          <SelectItem key={guest.id} value={String(guest.id)}>
                            {guest.first_name} {guest.last_name}
                            {guest.group && ` (${guest.group})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-[var(--muted-foreground)]">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a table to manage seating</p>
                </CardContent>
              </Card>
            )}

            {/* Unassigned Guests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Unassigned Guests</CardTitle>
                <CardDescription>{unassignedGuests.length} guests</CardDescription>
              </CardHeader>
              <CardContent>
                {unassignedGuests.length === 0 ? (
                  <p className="text-sm text-[var(--muted-foreground)]">All guests are seated!</p>
                ) : (
                  <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                    {unassignedGuests.map(guest => (
                      <div key={guest.id} className="flex items-center justify-between p-2 rounded bg-[var(--muted)]">
                        <div>
                          <span className="text-sm font-medium">
                            {guest.first_name} {guest.last_name}
                          </span>
                          {guest.group && (
                            <span className="text-xs text-[var(--muted-foreground)] ml-2">
                              {guest.group}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
