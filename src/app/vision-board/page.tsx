"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, ImageIcon, Palette, X, Check, Search, Loader2 } from "lucide-react"

interface VisionItem {
  id: number
  section: string
  image_url: string | null
  title: string | null
  notes: string | null
  order: number
}

interface WeddingEvent {
  id: number
  name: string
  date: string
  start_time: string | null
  end_time: string | null
  colors: string | null
}

// Preset color options for the picker
const colorOptions = [
  { name: "Maroon", color: "#8B1538" },
  { name: "Gold", color: "#C9A227" },
  { name: "Ivory", color: "#FFFBF5" },
  { name: "Magenta", color: "#C71585" },
  { name: "Teal", color: "#008080" },
  { name: "Coral", color: "#FF6B6B" },
  { name: "Navy", color: "#1E3A5F" },
  { name: "Blush", color: "#F8E0E0" },
  { name: "Sage", color: "#9CAF88" },
  { name: "Burgundy", color: "#722F37" },
  { name: "Champagne", color: "#F7E7CE" },
  { name: "Rose Gold", color: "#B76E79" },
  { name: "Emerald", color: "#046307" },
  { name: "Lavender", color: "#E6E6FA" },
  { name: "Dusty Blue", color: "#6699CC" },
  { name: "Terracotta", color: "#CB6843" },
  { name: "Mustard", color: "#FFDB58" },
  { name: "Plum", color: "#8E4585" },
  { name: "Mint", color: "#98FF98" },
  { name: "Peach", color: "#FFCBA4" },
]

export default function VisionBoardPage() {
  const [items, setItems] = useState<VisionItem[]>([])
  const [events, setEvents] = useState<WeddingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [activeEvent, setActiveEvent] = useState<string>("")
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [customColor, setCustomColor] = useState("#000000")

  const [formData, setFormData] = useState({
    section: "",
    imageUrl: "",
    title: "",
    notes: ""
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [itemsRes, eventsRes] = await Promise.all([
        fetch("/api/vision"),
        fetch("/api/events")
      ])
      const itemsData = await itemsRes.json()
      const eventsData = await eventsRes.json()

      setItems(itemsData || [])
      setEvents(eventsData || [])

      if (eventsData && eventsData.length > 0 && !activeEvent) {
        setActiveEvent(eventsData[0].name.toLowerCase().replace(/\s+/g, '_').replace(/&/g, ''))
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const res = await fetch(`/api/vision/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const selectImage = (url: string, alt_description: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: url,
      title: !prev.title ? (alt_description || "").charAt(0).toUpperCase() + (alt_description || "").slice(1) : prev.title
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
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
      await fetch(`/api/vision?id=${id}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("Failed to delete item:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      section: activeEvent,
      imageUrl: "",
      title: "",
      notes: ""
    })
  }

  const openAddDialog = () => {
    setFormData({
      section: activeEvent,
      imageUrl: "",
      title: "",
      notes: ""
    })
    setSearchQuery("")
    setSearchResults([])
    setDialogOpen(true)
  }

  const getCurrentEvent = () => {
    return events.find(e =>
      e.name.toLowerCase().replace(/\s+/g, '_').replace(/&/g, '') === activeEvent
    )
  }

  const getEventColors = (event: WeddingEvent | undefined): string[] => {
    if (!event?.colors) return []
    try {
      return JSON.parse(event.colors)
    } catch {
      return []
    }
  }

  const openColorPicker = () => {
    const event = getCurrentEvent()
    setSelectedColors(getEventColors(event))
    setColorPickerOpen(true)
  }

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color))
    } else if (selectedColors.length < 5) {
      setSelectedColors([...selectedColors, color])
    }
  }

  const addCustomColor = () => {
    if (!selectedColors.includes(customColor) && selectedColors.length < 5) {
      setSelectedColors([...selectedColors, customColor])
    }
  }

  const removeColor = (color: string) => {
    setSelectedColors(selectedColors.filter(c => c !== color))
  }

  const saveColors = async () => {
    const event = getCurrentEvent()
    if (!event) return

    try {
      await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: event.id, colors: selectedColors })
      })
      fetchData()
      setColorPickerOpen(false)
    } catch (error) {
      console.error("Failed to save colors:", error)
    }
  }

  const currentEvent = getCurrentEvent()
  const currentColors = getEventColors(currentEvent)

  const formatEventDate = (event: WeddingEvent) => {
    return new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getEventKey = (event: WeddingEvent) => {
    return event.name.toLowerCase().replace(/\s+/g, '_').replace(/&/g, '')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
              Vision Board
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              Collect inspiration for each event
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add to {currentEvent?.name || 'Event'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add Inspiration</DialogTitle>
                  <DialogDescription>
                    Save an image or idea for {currentEvent?.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="event">Event</Label>
                    <Select
                      value={formData.section}
                      onValueChange={(value) => setFormData({ ...formData, section: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((e) => (
                          <SelectItem key={e.id} value={getEventKey(e)}>
                            {e.name} ({formatEventDate(e)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Tabs defaultValue="url" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="url">Image URL</TabsTrigger>
                      <TabsTrigger value="search">Search Unsplash</TabsTrigger>
                    </TabsList>

                    <TabsContent value="url" className="mt-4 space-y-2">
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="imageUrl"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          placeholder="https://..."
                        />
                        {formData.imageUrl && (
                          <div className="w-10 h-10 relative rounded overflow-hidden border shrink-0 bg-[var(--muted)]">
                            <img
                              src={formData.imageUrl}
                              className="w-full h-full object-cover"
                              alt="Preview"
                              onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                            />
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="search" className="mt-4 space-y-4">
                      <div className="flex gap-2">
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search for inspiration..."
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                        />
                        <Button type="button" onClick={handleSearch} disabled={isSearching}>
                          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        </Button>
                      </div>

                      {searchResults.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-[500px] overflow-y-auto pr-1">
                          {searchResults.map((photo: any) => (
                            <button
                              key={photo.id}
                              type="button"
                              className={`relative aspect-square overflow-hidden rounded border transition-all hover:scale-105 focus:outline-none ${formData.imageUrl === photo.urls.regular ? 'ring-2 ring-[var(--primary)] border-[var(--primary)]' : 'hover:ring-2 ring-[var(--muted-foreground)]'
                                }`}
                              onClick={() => selectImage(photo.urls.regular, photo.alt_description)}
                            >
                              <img src={photo.urls.thumb} alt={photo.alt_description} className="w-full h-full object-cover" />
                              {formData.imageUrl === photo.urls.regular && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <Check className="w-6 h-6 text-white" />
                                </div>
                              )}
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-white p-0.5 truncate px-1 opacity-0 hover:opacity-100 transition-opacity">
                                by {photo.user.name}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        !isSearching && searchQuery && <p className="text-sm text-center text-[var(--muted-foreground)] py-4">No results found.</p>
                      )}
                    </TabsContent>
                  </Tabs>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title (optional)</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Give your inspiration a name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="What do you love about this?"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    Add to Board
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Event Tabs */}
        {events.length > 0 && (
          <Tabs value={activeEvent} onValueChange={setActiveEvent}>
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${events.length}, 1fr)` }}>
              {events.map((event) => (
                <TabsTrigger key={event.id} value={getEventKey(event)} className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">{event.name}</span>
                  <span className="sm:hidden">{event.name.split(' ')[0]}</span>
                  <span className="ml-1 text-[var(--muted-foreground)]">
                    ({items.filter(i => i.section === getEventKey(event)).length})
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {events.map((event) => (
              <TabsContent key={event.id} value={getEventKey(event)} className="mt-6">
                {/* Event Header with Colors */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">{event.name}</h2>
                    <p className="text-sm text-[var(--muted-foreground)]">{formatEventDate(event)}</p>
                  </div>

                  {/* Color Palette Section */}
                  <Card className="sm:w-auto w-full">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Palette className="w-4 h-4 text-[var(--muted-foreground)]" />
                        {getEventColors(event).length > 0 ? (
                          <div className="flex gap-2">
                            {getEventColors(event).map((color, idx) => (
                              <div
                                key={idx}
                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-[var(--muted-foreground)]">No colors selected</span>
                        )}
                        <Dialog open={colorPickerOpen && getEventKey(event) === activeEvent} onOpenChange={setColorPickerOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={openColorPicker}>
                              {getEventColors(event).length > 0 ? 'Edit' : 'Choose Colors'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Choose Colors for {event.name}</DialogTitle>
                              <DialogDescription>
                                Select 3-5 colors for this event
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              {/* Selected Colors */}
                              <div>
                                <Label className="mb-2 block">Selected ({selectedColors.length}/5)</Label>
                                <div className="flex gap-2 flex-wrap min-h-[44px] p-2 border rounded-lg bg-[var(--muted)]">
                                  {selectedColors.length === 0 ? (
                                    <span className="text-sm text-[var(--muted-foreground)]">Click colors below to select</span>
                                  ) : (
                                    selectedColors.map((color, idx) => (
                                      <div
                                        key={idx}
                                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm relative group cursor-pointer"
                                        style={{ backgroundColor: color }}
                                        onClick={() => removeColor(color)}
                                        title={`${color} - Click to remove`}
                                      >
                                        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                          <X className="w-4 h-4 text-white" />
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                              {/* Preset Colors */}
                              <div>
                                <Label className="mb-2 block">Preset Colors</Label>
                                <div className="grid grid-cols-5 gap-2">
                                  {colorOptions.map((c) => (
                                    <button
                                      key={c.color}
                                      type="button"
                                      className={`w-10 h-10 rounded-full border-2 shadow-sm relative transition-transform hover:scale-110 ${selectedColors.includes(c.color) ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]' : 'border-white'
                                        }`}
                                      style={{ backgroundColor: c.color }}
                                      onClick={() => toggleColor(c.color)}
                                      title={c.name}
                                      disabled={selectedColors.length >= 5 && !selectedColors.includes(c.color)}
                                    >
                                      {selectedColors.includes(c.color) && (
                                        <Check className="w-4 h-4 absolute inset-0 m-auto text-white drop-shadow-md" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Custom Color */}
                              <div>
                                <Label className="mb-2 block">Custom Color</Label>
                                <div className="flex gap-2">
                                  <input
                                    type="color"
                                    value={customColor}
                                    onChange={(e) => setCustomColor(e.target.value)}
                                    className="w-10 h-10 rounded cursor-pointer border-0"
                                  />
                                  <Input
                                    value={customColor}
                                    onChange={(e) => setCustomColor(e.target.value)}
                                    placeholder="#000000"
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addCustomColor}
                                    disabled={selectedColors.length >= 5 || selectedColors.includes(customColor)}
                                  >
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={saveColors}
                                disabled={selectedColors.length < 3}
                              >
                                Save Colors ({selectedColors.length}/5)
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Vision Board Grid */}
                {loading ? (
                  <p className="text-center py-8 text-[var(--muted-foreground)]">Loading...</p>
                ) : items.filter(i => i.section === getEventKey(event)).length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <ImageIcon className="w-16 h-16 mx-auto mb-4 text-[var(--muted-foreground)] opacity-50" />
                      <p className="text-[var(--muted-foreground)] mb-4">
                        No inspiration for {event.name} yet.
                      </p>
                      <Button variant="outline" onClick={openAddDialog}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Image
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.filter(i => i.section === getEventKey(event)).map((item) => (
                      <Card key={item.id} className="overflow-hidden group">
                        {item.image_url ? (
                          <div className="aspect-square bg-[var(--muted)] relative">
                            <img
                              src={item.image_url}
                              alt={item.title || "Inspiration"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = ''
                                  ; (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => deleteItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="aspect-square bg-[var(--muted)] flex items-center justify-center relative">
                            <ImageIcon className="w-12 h-12 text-[var(--muted-foreground)] opacity-50" />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => deleteItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        {(item.title || item.notes) && (
                          <CardContent className="p-3">
                            {item.title && (
                              <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                            )}
                            {item.notes && (
                              <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
                                {item.notes}
                              </p>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}
