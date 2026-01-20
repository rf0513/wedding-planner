"use client"

import { useEffect, useState } from "react"
import { upload } from "@vercel/blob/client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, ImageIcon, Palette, X, Check, Loader2, Upload as UploadIcon, ExternalLink } from "lucide-react"

interface VisionItem {
  id: number
  section: string
  image_url: string | null
}

interface WeddingEvent {
  id: number
  name: string
  date: string
  colors: string | null
}

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
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [activeEvent, setActiveEvent] = useState<string>("")
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [customColor, setCustomColor] = useState("#000000")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [dragActive, setDragActive] = useState(false)
  const [activeBoard, setActiveBoard] = useState<'outfits' | 'decor'>('outfits')

  const BOARD_TYPES = [
    { key: 'outfits', label: 'Outfits' },
    { key: 'decor', label: 'Decor' }
  ] as const

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

  const uploadFile = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(ext) ? ext : 'jpg'
    const safeName = `vision-board/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`

    const blob = await upload(safeName, file, {
      access: 'public',
      handleUploadUrl: '/api/upload',
    })
    return blob.url
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    e.preventDefault()
    let files: File[] = []

    if ('dataTransfer' in e) {
      files = Array.from(e.dataTransfer.files)
    } else if (e.target.files) {
      files = Array.from(e.target.files)
    }

    if (files.length === 0) return

    setIsUploading(true)
    setUploadProgress({ current: 0, total: files.length })
    let successCount = 0
    const failures: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setUploadProgress({ current: i + 1, total: files.length })

      try {
        const url = await uploadFile(file)

        await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            section: `${activeEvent}_${activeBoard}`,
            imageUrl: url,
          })
        })
        successCount++
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        failures.push(`${file.name}: ${errorMsg}`)
        console.error(`Failed to upload ${file.name}:`, error)
      }
    }

    setIsUploading(false)
    setUploadProgress({ current: 0, total: 0 })
    setDragActive(false)
    fetchData()

    // Reset file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''

    if (failures.length > 0) {
      alert(`Uploaded ${successCount} of ${files.length} images.\n\nFailed:\n${failures.join('\n')}`)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const deleteItem = async (id: number) => {
    if (!confirm("Delete this image?")) return

    try {
      await fetch(`/api/vision?id=${id}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("Failed to delete item:", error)
    }
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

  const getEventKey = (event: WeddingEvent) => {
    return event.name.toLowerCase().replace(/\s+/g, '_').replace(/&/g, '')
  }

  const getSectionKey = (event: WeddingEvent, boardType: string) => {
    return `${getEventKey(event)}_${boardType}`
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
          <Button
            variant="outline"
            onClick={() => {
              const event = getCurrentEvent()
              const searchQuery = encodeURIComponent(`${event?.name || 'wedding'} wedding inspiration`)
              window.open(`https://pinterest.com/search/pins/?q=${searchQuery}`, '_blank')
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Pinterest Ideas
          </Button>
        </div>

        {events.length > 0 && (
          <Tabs value={activeEvent} onValueChange={setActiveEvent}>
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${events.length}, 1fr)` }}>
              {events.map((event) => (
                <TabsTrigger key={event.id} value={getEventKey(event)} className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">{event.name}</span>
                  <span className="sm:hidden">{event.name.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {events.map((event) => {
              const colors = getEventColors(event)
              const eventItems = items.filter(i => i.section === getSectionKey(event, activeBoard))

              return (
                <TabsContent key={event.id} value={getEventKey(event)} className="mt-6 space-y-6">
                  {/* Mood Colors - Prominent */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <Palette className="w-5 h-5 text-[var(--muted-foreground)]" />
                          <span className="font-medium">Mood Colors</span>
                        </div>

                        <div className="flex-1 flex items-center gap-3">
                          {colors.length > 0 ? (
                            <div className="flex gap-2">
                              {colors.map((color, idx) => (
                                <div
                                  key={idx}
                                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white shadow-md"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-[var(--muted-foreground)]">No colors selected</span>
                          )}
                        </div>

                        <Dialog open={colorPickerOpen && getEventKey(event) === activeEvent} onOpenChange={setColorPickerOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" onClick={openColorPicker}>
                              {colors.length > 0 ? 'Edit Colors' : 'Choose Colors'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Mood Colors for {event.name}</DialogTitle>
                              <DialogDescription>Select 3-5 colors</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label className="mb-2 block">Selected ({selectedColors.length}/5)</Label>
                                <div className="flex gap-2 flex-wrap min-h-[44px] p-2 border rounded-lg bg-[var(--muted)]">
                                  {selectedColors.length === 0 ? (
                                    <span className="text-sm text-[var(--muted-foreground)]">Click colors below</span>
                                  ) : (
                                    selectedColors.map((color, idx) => (
                                      <div
                                        key={idx}
                                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm relative group cursor-pointer"
                                        style={{ backgroundColor: color }}
                                        onClick={() => removeColor(color)}
                                      >
                                        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                          <X className="w-4 h-4 text-white" />
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                              <div>
                                <Label className="mb-2 block">Preset Colors</Label>
                                <div className="grid grid-cols-5 gap-2">
                                  {colorOptions.map((c) => (
                                    <button
                                      key={c.color}
                                      type="button"
                                      className={`w-10 h-10 rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${
                                        selectedColors.includes(c.color) ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]' : 'border-white'
                                      }`}
                                      style={{ backgroundColor: c.color }}
                                      onClick={() => toggleColor(c.color)}
                                      title={c.name}
                                      disabled={selectedColors.length >= 5 && !selectedColors.includes(c.color)}
                                    >
                                      {selectedColors.includes(c.color) && (
                                        <Check className="w-4 h-4 m-auto text-white drop-shadow-md" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>

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
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addCustomColor}
                                    disabled={selectedColors.length >= 5}
                                  >
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={saveColors} disabled={selectedColors.length < 3}>
                                Save Colors
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Board Type Toggle */}
                  <div className="flex gap-2">
                    {BOARD_TYPES.map((board) => (
                      <Button
                        key={board.key}
                        variant={activeBoard === board.key ? 'default' : 'outline'}
                        onClick={() => setActiveBoard(board.key)}
                        className="flex-1"
                      >
                        {board.label}
                      </Button>
                    ))}
                  </div>

                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive ? 'border-[var(--primary)] bg-[var(--primary)]/10' : 'border-[var(--muted-foreground)]/25 hover:bg-[var(--muted)]'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleFileUpload}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                    />
                    <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--muted-foreground)]" />
                      ) : (
                        <UploadIcon className="w-8 h-8 text-[var(--muted-foreground)]" />
                      )}
                      <span className="text-sm font-medium">
                        {isUploading
                          ? uploadProgress.total > 1
                            ? `Uploading ${uploadProgress.current} of ${uploadProgress.total}...`
                            : "Uploading..."
                          : "Click to upload or drag & drop"}
                      </span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        Select multiple images at once
                      </span>
                    </Label>
                  </div>

                  {/* Image Grid */}
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[var(--muted-foreground)]" />
                    </div>
                  ) : eventItems.length === 0 ? (
                    <div className="text-center py-12">
                      <ImageIcon className="w-16 h-16 mx-auto mb-4 text-[var(--muted-foreground)] opacity-50" />
                      <p className="text-[var(--muted-foreground)]">
                        No images yet. Upload some inspiration!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {eventItems.map((item) => (
                        <div key={item.id} className="aspect-square relative group rounded-lg overflow-hidden bg-[var(--muted)]">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-[var(--muted-foreground)] opacity-50" />
                            </div>
                          )}
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteItem(item.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              )
            })}
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}
