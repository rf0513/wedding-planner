"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Phone, Mail, Globe, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Vendor {
  id: number
  category: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  website: string | null
  contract_url: string | null
  total_cost: number
  paid: number
  notes: string | null
}

const vendorCategories = [
  "Venue",
  "Catering",
  "Photography",
  "Videography",
  "Decor",
  "Florist",
  "Music/DJ",
  "Mehendi Artist",
  "Makeup Artist",
  "Hair Stylist",
  "Transportation",
  "Lighting",
  "Pandit/Priest",
  "Invitation Designer",
  "Cake/Desserts",
  "Other"
]

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>("all")

  const [formData, setFormData] = useState({
    category: "",
    name: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    contractUrl: "",
    totalCost: "",
    paid: "",
    notes: ""
  })

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    try {
      const res = await fetch("/api/vendors")
      const data = await res.json()
      setVendors(data || [])
    } catch (error) {
      console.error("Failed to fetch vendors:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const method = editingVendor ? "PUT" : "POST"
    const body = {
      id: editingVendor?.id,
      ...formData,
      totalCost: parseFloat(formData.totalCost) || 0,
      paid: parseFloat(formData.paid) || 0
    }

    try {
      await fetch("/api/vendors", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      fetchVendors()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to save vendor:", error)
    }
  }

  const deleteVendor = async (id: number) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return

    try {
      await fetch(`/api/vendors?id=${id}`, { method: "DELETE" })
      fetchVendors()
    } catch (error) {
      console.error("Failed to delete vendor:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      category: "",
      name: "",
      contactName: "",
      email: "",
      phone: "",
      website: "",
      contractUrl: "",
      totalCost: "",
      paid: "",
      notes: ""
    })
    setEditingVendor(null)
  }

  const openEditDialog = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setFormData({
      category: vendor.category,
      name: vendor.name,
      contactName: vendor.contact_name || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      website: vendor.website || "",
      contractUrl: vendor.contract_url || "",
      totalCost: String(vendor.total_cost),
      paid: String(vendor.paid),
      notes: vendor.notes || ""
    })
    setDialogOpen(true)
  }

  const filteredVendors = vendors.filter(vendor => {
    return filterCategory === "all" || vendor.category === filterCategory
  })

  const totalCost = vendors.reduce((sum, v) => sum + v.total_cost, 0)
  const totalPaid = vendors.reduce((sum, v) => sum + v.paid, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
              Vendor Management
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              Manage your wedding vendors and contracts
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingVendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
                  <DialogDescription>
                    Track vendor details and payments
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {vendorCategories.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Vendor Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Person</Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
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
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalCost">Total Cost</Label>
                      <Input
                        id="totalCost"
                        type="number"
                        value={formData.totalCost}
                        onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paid">Amount Paid</Label>
                      <Input
                        id="paid"
                        type="number"
                        value={formData.paid}
                        onChange={(e) => setFormData({ ...formData, paid: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Contract details, special arrangements, etc."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingVendor ? "Update" : "Add"} Vendor
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-[var(--muted-foreground)]">Total Vendors</div>
              <div className="text-2xl font-bold mt-2">{vendors.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-[var(--muted-foreground)]">Total Contract Value</div>
              <div className="text-2xl font-bold mt-2">{formatCurrency(totalCost)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-[var(--muted-foreground)]">Total Paid</div>
              <div className="text-2xl font-bold mt-2 text-[var(--success)]">{formatCurrency(totalPaid)}</div>
              <Progress value={(totalPaid / totalCost) * 100 || 0} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex gap-4">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {vendorCategories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Vendor List */}
        <div className="grid gap-4 md:grid-cols-2">
          {loading ? (
            <p className="col-span-2 text-center py-8 text-[var(--muted-foreground)]">Loading...</p>
          ) : filteredVendors.length === 0 ? (
            <p className="col-span-2 text-center py-8 text-[var(--muted-foreground)]">
              No vendors found. Add your first vendor to get started!
            </p>
          ) : (
            filteredVendors.map((vendor) => {
              const paymentProgress = (vendor.paid / vendor.total_cost) * 100 || 0
              const remaining = vendor.total_cost - vendor.paid

              return (
                <Card key={vendor.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{vendor.name}</CardTitle>
                          <Badge variant="outline">{vendor.category}</Badge>
                        </div>
                        {vendor.contact_name && (
                          <CardDescription>{vendor.contact_name}</CardDescription>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(vendor)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteVendor(vendor.id)}
                          className="text-[var(--destructive)]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-4 text-sm text-[var(--muted-foreground)]">
                      {vendor.phone && (
                        <a href={`tel:${vendor.phone}`} className="flex items-center gap-1 hover:text-[var(--primary)]">
                          <Phone className="w-4 h-4" />
                          {vendor.phone}
                        </a>
                      )}
                      {vendor.email && (
                        <a href={`mailto:${vendor.email}`} className="flex items-center gap-1 hover:text-[var(--primary)]">
                          <Mail className="w-4 h-4" />
                          {vendor.email}
                        </a>
                      )}
                      {vendor.website && (
                        <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[var(--primary)]">
                          <Globe className="w-4 h-4" />
                          Website
                        </a>
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          Payment Progress
                        </span>
                        <span>{formatCurrency(vendor.paid)} / {formatCurrency(vendor.total_cost)}</span>
                      </div>
                      <Progress value={paymentProgress} className="h-2" />
                      {remaining > 0 && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          {formatCurrency(remaining)} remaining
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
