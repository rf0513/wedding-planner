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
import { Plus, Edit, Trash2, Phone, Mail, Heart, Users } from "lucide-react"

interface WeddingPartyMember {
  id: number
  name: string
  role: string
  side: string | null
  email: string | null
  phone: string | null
  responsibilities: string | null
  attire_details: string | null
  notes: string | null
}

const roles = [
  "Maid of Honor",
  "Best Man",
  "Bridesmaid",
  "Groomsman",
  "Flower Girl",
  "Ring Bearer",
  "Usher",
  "Officiant",
  "Parent of Bride",
  "Parent of Groom",
  "MC/Host",
  "Other"
]

const sides = [
  { value: "bride", label: "Bride's Side" },
  { value: "groom", label: "Groom's Side" },
  { value: "both", label: "Both" }
]

export default function WeddingPartyPage() {
  const [members, setMembers] = useState<WeddingPartyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<WeddingPartyMember | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    side: "",
    email: "",
    phone: "",
    responsibilities: "",
    attireDetails: "",
    notes: ""
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/wedding-party")
      const data = await res.json()
      setMembers(data || [])
    } catch (error) {
      console.error("Failed to fetch wedding party:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const method = editingMember ? "PUT" : "POST"
    const body = {
      id: editingMember?.id,
      ...formData
    }

    try {
      await fetch("/api/wedding-party", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      fetchMembers()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to save member:", error)
    }
  }

  const deleteMember = async (id: number) => {
    if (!confirm("Are you sure you want to remove this member?")) return

    try {
      await fetch(`/api/wedding-party?id=${id}`, { method: "DELETE" })
      fetchMembers()
    } catch (error) {
      console.error("Failed to delete member:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      side: "",
      email: "",
      phone: "",
      responsibilities: "",
      attireDetails: "",
      notes: ""
    })
    setEditingMember(null)
  }

  const openEditDialog = (member: WeddingPartyMember) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      role: member.role,
      side: member.side || "",
      email: member.email || "",
      phone: member.phone || "",
      responsibilities: member.responsibilities || "",
      attireDetails: member.attire_details || "",
      notes: member.notes || ""
    })
    setDialogOpen(true)
  }

  const bridesSide = members.filter(m => m.side === "bride")
  const groomsSide = members.filter(m => m.side === "groom")
  const bothSides = members.filter(m => m.side === "both" || !m.side)

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
              Wedding Party
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              Manage your bridal party and special roles
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingMember ? "Edit Member" : "Add Wedding Party Member"}</DialogTitle>
                  <DialogDescription>
                    Add someone to your wedding party
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData({ ...formData, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="side">Side</Label>
                    <Select
                      value={formData.side}
                      onValueChange={(value) => setFormData({ ...formData, side: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select side" />
                      </SelectTrigger>
                      <SelectContent>
                        {sides.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="responsibilities">Responsibilities</Label>
                    <Textarea
                      id="responsibilities"
                      value={formData.responsibilities}
                      onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                      placeholder="What are they responsible for?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="attireDetails">Attire Details</Label>
                    <Textarea
                      id="attireDetails"
                      value={formData.attireDetails}
                      onChange={(e) => setFormData({ ...formData, attireDetails: e.target.value })}
                      placeholder="Outfit details for each event"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={!formData.name || !formData.role}>
                    {editingMember ? "Update" : "Add"} Member
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
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--primary)]" />
                <span className="text-sm text-[var(--muted-foreground)]">Total Members</span>
              </div>
              <div className="text-2xl font-bold mt-2">{members.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-[var(--muted-foreground)]">Bride&apos;s Side</div>
              <div className="text-2xl font-bold mt-2">{bridesSide.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-[var(--muted-foreground)]">Groom&apos;s Side</div>
              <div className="text-2xl font-bold mt-2">{groomsSide.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Members by Side */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Members</TabsTrigger>
            <TabsTrigger value="bride">Bride&apos;s Side</TabsTrigger>
            <TabsTrigger value="groom">Groom&apos;s Side</TabsTrigger>
          </TabsList>

          {["all", "bride", "groom"].map((tab) => {
            const tabMembers = tab === "all"
              ? members
              : tab === "bride"
              ? bridesSide
              : groomsSide

            return (
              <TabsContent key={tab} value={tab} className="mt-6">
                {loading ? (
                  <p className="text-center py-8 text-[var(--muted-foreground)]">Loading...</p>
                ) : tabMembers.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Heart className="w-16 h-16 mx-auto mb-4 text-[var(--muted-foreground)] opacity-50" />
                      <p className="text-[var(--muted-foreground)]">
                        No wedding party members {tab !== "all" ? `on ${tab === "bride" ? "bride's" : "groom's"} side` : ""} yet.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tabMembers.map((member) => (
                      <Card key={member.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{member.name}</CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Badge>{member.role}</Badge>
                                {member.side && (
                                  <Badge variant="outline">
                                    {member.side === "bride" ? "Bride's" : member.side === "groom" ? "Groom's" : "Both"}
                                  </Badge>
                                )}
                              </CardDescription>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(member)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteMember(member.id)}
                                className="text-[var(--destructive)]"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex flex-wrap gap-3 text-sm text-[var(--muted-foreground)]">
                            {member.phone && (
                              <a href={`tel:${member.phone}`} className="flex items-center gap-1 hover:text-[var(--primary)]">
                                <Phone className="w-4 h-4" />
                                {member.phone}
                              </a>
                            )}
                            {member.email && (
                              <a href={`mailto:${member.email}`} className="flex items-center gap-1 hover:text-[var(--primary)]">
                                <Mail className="w-4 h-4" />
                                {member.email}
                              </a>
                            )}
                          </div>
                          {member.responsibilities && (
                            <div>
                              <p className="text-xs font-medium text-[var(--muted-foreground)]">Responsibilities</p>
                              <p className="text-sm">{member.responsibilities}</p>
                            </div>
                          )}
                          {member.attire_details && (
                            <div>
                              <p className="text-xs font-medium text-[var(--muted-foreground)]">Attire</p>
                              <p className="text-sm">{member.attire_details}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
