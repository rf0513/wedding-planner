"use client"

import { useEffect, useState, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Edit, DollarSign, TrendingUp, TrendingDown, PieChart, Sliders, Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { ExportPdfButton } from "@/components/export-pdf-button"

const TOTAL_BUDGET = 80000

interface BudgetCategory {
  id: number
  name: string
  event_id: number | null
  planned_amount: number
  order: number
  total_planned: number
  total_actual: number
  total_paid: number
}

interface BudgetItem {
  id: number
  category_id: number
  event_id: number | null
  event_name?: string
  name: string
  vendor: string | null
  planned: number
  actual: number
  paid: number
  due_date: string | null
  notes: string | null
}

interface WeddingEvent {
  id: number
  name: string
  date: string
  order: number
}

// Colors for budget visualization
const CATEGORY_COLORS = [
  '#8B1538', // Deep maroon
  '#C9A227', // Gold
  '#0D9488', // Teal
  '#DB2777', // Magenta
  '#F97316', // Coral/Orange
  '#6366F1', // Indigo
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#14B8A6', // Cyan
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
]

export default function BudgetPage() {
  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [items, setItems] = useState<BudgetItem[]>([])
  const [events, setEvents] = useState<WeddingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)
  const [categoryBudgets, setCategoryBudgets] = useState<Record<number, string>>({})
  const [savingCategory, setSavingCategory] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    categoryId: "",
    eventId: "0", // "0" means None/Unassigned
    name: "",
    vendor: "",
    planned: "",
    actual: "",
    paid: "",
    dueDate: "",
    notes: ""
  })

  const fetchBudget = useCallback(async () => {
    try {
      const res = await fetch("/api/budget")
      const data = await res.json()
      setCategories(data.categories || [])
      setItems(data.items || [])
      setEvents(data.events || [])
      // Initialize category budgets from fetched data
      const budgets: Record<number, string> = {}
      for (const cat of data.categories || []) {
        budgets[cat.id] = String(cat.planned_amount || 0)
      }
      setCategoryBudgets(budgets)
    } catch (error) {
      console.error("Failed to fetch budget:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBudget()
  }, [fetchBudget])

  const saveCategoryBudget = async (categoryId: number) => {
    const amount = parseFloat(categoryBudgets[categoryId]) || 0
    setSavingCategory(categoryId)
    try {
      await fetch("/api/budget", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "category",
          id: categoryId,
          plannedAmount: amount
        })
      })
      fetchBudget()
    } catch (error) {
      console.error("Failed to save category budget:", error)
    } finally {
      setSavingCategory(null)
    }
  }

  const handleCategoryBudgetChange = (categoryId: number, value: string) => {
    setCategoryBudgets(prev => ({ ...prev, [categoryId]: value }))
  }

  const handleCategoryBudgetBlur = (categoryId: number) => {
    const currentValue = parseFloat(categoryBudgets[categoryId]) || 0
    const originalValue = categories.find(c => c.id === categoryId)?.planned_amount || 0
    if (currentValue !== originalValue) {
      saveCategoryBudget(categoryId)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const method = editingItem ? "PUT" : "POST"
    const eventIdVal = parseInt(formData.eventId)
    const body = {
      type: "item",
      id: editingItem?.id,
      categoryId: parseInt(formData.categoryId),
      eventId: eventIdVal === 0 ? null : eventIdVal,
      name: formData.name,
      vendor: formData.vendor || null,
      planned: parseFloat(formData.planned) || 0,
      actual: parseFloat(formData.actual) || 0,
      paid: parseFloat(formData.paid) || 0,
      dueDate: formData.dueDate || null,
      notes: formData.notes || null
    }

    try {
      await fetch("/api/budget", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      fetchBudget()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to save item:", error)
    }
  }

  const deleteItem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      await fetch(`/api/budget?id=${id}&type=item`, { method: "DELETE" })
      fetchBudget()
    } catch (error) {
      console.error("Failed to delete item:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      categoryId: "",
      eventId: "0",
      name: "",
      vendor: "",
      planned: "",
      actual: "",
      paid: "",
      dueDate: "",
      notes: ""
    })
    setEditingItem(null)
  }

  const openEditDialog = (item: BudgetItem) => {
    setEditingItem(item)
    setFormData({
      categoryId: String(item.category_id),
      eventId: item.event_id ? String(item.event_id) : "0",
      name: item.name,
      vendor: item.vendor || "",
      planned: String(item.planned),
      actual: String(item.actual),
      paid: String(item.paid),
      dueDate: item.due_date || "",
      notes: item.notes || ""
    })
    setDialogOpen(true)
  }

  // Category-level budget allocation
  const totalAllocated = categories.reduce((sum, c) => sum + (c.planned_amount || 0), 0)
  const unallocated = TOTAL_BUDGET - totalAllocated
  const allocationPercent = (totalAllocated / TOTAL_BUDGET) * 100

  // Item-level tracking
  const totalPlanned = items.reduce((sum, i) => sum + (i.planned || 0), 0)
  const totalActual = items.reduce((sum, i) => sum + (i.actual || 0), 0)
  const totalPaid = items.reduce((sum, i) => sum + (i.paid || 0), 0)
  const totalRemaining = totalActual - totalPaid

  const budgetStatus = totalActual <= TOTAL_BUDGET ? "under" : "over"
  const budgetDiff = Math.abs(totalActual - TOTAL_BUDGET)

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
              Budget Tracker
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              Track your wedding expenses and payments
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <ExportPdfButton title="Export PDF" />
            <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Edit Expense" : "Add New Expense"}</DialogTitle>
                  <DialogDescription>
                    Track a wedding expense
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event">Event (Optional)</Label>
                      <Select
                        value={formData.eventId}
                        onValueChange={(value) => setFormData({ ...formData, eventId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select event" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">General / None</SelectItem>
                          {events.map((e) => (
                            <SelectItem key={e.id} value={String(e.id)}>
                              {e.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Venue booking deposit"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendor">Vendor</Label>
                    <Input
                      id="vendor"
                      value={formData.vendor}
                      onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                      placeholder="Vendor name"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="planned">Planned</Label>
                      <Input
                        id="planned"
                        type="number"
                        value={formData.planned}
                        onChange={(e) => setFormData({ ...formData, planned: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="actual">Actual</Label>
                      <Input
                        id="actual"
                        type="number"
                        value={formData.actual}
                        onChange={(e) => setFormData({ ...formData, actual: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paid">Paid</Label>
                      <Input
                        id="paid"
                        type="number"
                        value={formData.paid}
                        onChange={(e) => setFormData({ ...formData, paid: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingItem ? "Update" : "Add"} Expense
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-2 border-[var(--primary)]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[var(--primary)]" />
                <span className="text-sm text-[var(--muted-foreground)]">Total Budget</span>
              </div>
              <div className="text-2xl font-bold mt-2" style={{ color: 'var(--primary)' }}>{formatCurrency(TOTAL_BUDGET)}</div>
              <Progress value={allocationPercent} className="mt-2 h-2" />
              <p className="text-xs mt-1 text-[var(--muted-foreground)]">
                {formatCurrency(totalAllocated)} allocated
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[var(--muted-foreground)]" />
                <span className="text-sm text-[var(--muted-foreground)]">Unallocated</span>
              </div>
              <div className={`text-2xl font-bold mt-2 ${unallocated < 0 ? 'text-[var(--destructive)]' : 'text-[var(--success)]'}`}>
                {formatCurrency(unallocated)}
              </div>
              <p className="text-xs mt-1 text-[var(--muted-foreground)]">
                {unallocated < 0 ? 'Over budget!' : 'Still available'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                {budgetStatus === "under" ? (
                  <TrendingDown className="w-5 h-5 text-[var(--success)]" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-[var(--destructive)]" />
                )}
                <span className="text-sm text-[var(--muted-foreground)]">Spent</span>
              </div>
              <div className="text-2xl font-bold mt-2">{formatCurrency(totalActual)}</div>
              <p className={`text-xs mt-1 ${budgetStatus === "under" ? "text-[var(--success)]" : "text-[var(--destructive)]"}`}>
                {formatCurrency(budgetDiff)} {budgetStatus} budget
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-[var(--muted-foreground)]">Paid</div>
              <div className="text-2xl font-bold mt-2 text-[var(--success)]">{formatCurrency(totalPaid)}</div>
              <Progress value={(totalPaid / totalActual) * 100 || 0} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Budget by Category */}
        <Tabs defaultValue="plan">
          <TabsList>
            <TabsTrigger value="plan">
              <Sliders className="w-4 h-4 mr-2" />
              Plan Budget
            </TabsTrigger>
            <TabsTrigger value="overview">
              <PieChart className="w-4 h-4 mr-2" />
              Category Overview
            </TabsTrigger>
            <TabsTrigger value="by-event">
              <Calendar className="w-4 h-4 mr-2" />
              By Event
            </TabsTrigger>
            <TabsTrigger value="details">All Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="w-5 h-5" />
                  Allocate Your {formatCurrency(TOTAL_BUDGET)} Budget
                </CardTitle>
                <CardDescription>
                  Distribute your total budget across categories. Changes save automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Visual Budget Bar */}
                <div className="mb-6">
                  <div className="flex h-8 rounded-lg overflow-hidden border">
                    {categories.map((category, index) => {
                      const amount = category.planned_amount || 0
                      const percent = (amount / TOTAL_BUDGET) * 100
                      if (percent === 0) return null
                      return (
                        <div
                          key={category.id}
                          style={{
                            width: `${percent}%`,
                            backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                          }}
                          className="flex items-center justify-center text-white text-xs font-medium transition-all duration-300"
                          title={`${category.name}: ${formatCurrency(amount)} (${percent.toFixed(1)}%)`}
                        >
                          {percent > 8 && `${percent.toFixed(0)}%`}
                        </div>
                      )
                    })}
                    {unallocated > 0 && (
                      <div
                        style={{ width: `${(unallocated / TOTAL_BUDGET) * 100}%` }}
                        className="flex items-center justify-center text-[var(--muted-foreground)] text-xs bg-[var(--muted)]"
                      >
                        {(unallocated / TOTAL_BUDGET) * 100 > 8 && 'Unallocated'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Allocation Inputs */}
                <div className="space-y-4">
                  {categories.map((category, index) => {
                    const amount = parseFloat(categoryBudgets[category.id]) || 0
                    const percent = TOTAL_BUDGET > 0 ? (amount / TOTAL_BUDGET) * 100 : 0

                    return (
                      <div key={category.id} className="flex items-center gap-4">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                        />
                        <div className="flex-1 min-w-0">
                          <Label className="font-medium">{category.name}</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--muted-foreground)] text-sm">$</span>
                          <Input
                            type="number"
                            className="w-28 text-right"
                            value={categoryBudgets[category.id] || ""}
                            onChange={(e) => handleCategoryBudgetChange(category.id, e.target.value)}
                            onBlur={() => handleCategoryBudgetBlur(category.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCategoryBudgetBlur(category.id)
                                  ; (e.target as HTMLInputElement).blur()
                              }
                            }}
                            placeholder="0"
                            disabled={savingCategory === category.id}
                          />
                          <span className="text-[var(--muted-foreground)] text-sm w-14 text-right">
                            {percent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Summary */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Allocated</span>
                    <span className={`text-lg font-bold ${unallocated < 0 ? 'text-[var(--destructive)]' : ''}`}>
                      {formatCurrency(totalAllocated)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[var(--muted-foreground)]">Remaining to allocate</span>
                    <span className={`font-medium ${unallocated < 0 ? 'text-[var(--destructive)]' : 'text-[var(--success)]'}`}>
                      {formatCurrency(unallocated)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {categories.map((category, index) => {
                const categoryItems = items.filter(i => i.category_id === category.id)
                const catBudget = category.planned_amount || 0
                const catActual = categoryItems.reduce((s, i) => s + (i.actual || 0), 0)
                const progress = catBudget > 0 ? (catActual / catBudget) * 100 : 0

                return (
                  <Card key={category.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                        />
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                      </div>
                      <CardDescription>
                        Budget: {formatCurrency(catBudget)} • {categoryItems.length} expense{categoryItems.length !== 1 ? "s" : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm mb-2">
                        <span className={progress > 100 ? 'text-[var(--destructive)]' : ''}>
                          {formatCurrency(catActual)} spent
                        </span>
                        <span className="text-[var(--muted-foreground)]">
                          {catBudget > 0 ? `${formatCurrency(catBudget - catActual)} left` : 'No budget set'}
                        </span>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-2" />
                      {progress > 100 && (
                        <p className="text-xs text-[var(--destructive)] mt-1">
                          Over budget by {formatCurrency(catActual - catBudget)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="by-event" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {events.map((event) => {
                const eventItems = items.filter(i => i.event_id === event.id)
                const eventTotal = eventItems.reduce((sum, item) => sum + (item.actual || 0), 0)

                return (
                  <Card key={event.id}>
                    <CardHeader>
                      <CardTitle>{event.name}</CardTitle>
                      <CardDescription>{formatCurrency(eventTotal)} total expenses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {eventItems.length === 0 ? (
                        <p className="text-sm text-[var(--muted-foreground)]">No expenses assigned.</p>
                      ) : (
                        <div className="space-y-2">
                          {eventItems.map(item => (
                            <div key={item.id} className="flex justify-between text-sm border-b pb-1 last:border-0">
                              <span>{item.name}</span>
                              <span className="font-medium">{formatCurrency(item.actual)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}

              {/* Unassigned Items */}
              <Card>
                <CardHeader>
                  <CardTitle>General / Unassigned</CardTitle>
                  <CardDescription>
                    {formatCurrency(items.filter(i => !i.event_id).reduce((sum, item) => sum + (item.actual || 0), 0))} total
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {items.filter(i => !i.event_id).map(item => (
                      <div key={item.id} className="flex justify-between text-sm border-b pb-1 last:border-0">
                        <span>{item.name}</span>
                        <span className="font-medium">{formatCurrency(item.actual)}</span>
                      </div>
                    ))}
                    {items.filter(i => !i.event_id).length === 0 && (
                      <p className="text-sm text-[var(--muted-foreground)]">No unassigned expenses.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {loading ? (
                  <p className="text-center py-8 text-[var(--muted-foreground)]">Loading...</p>
                ) : items.length === 0 ? (
                  <p className="text-center py-8 text-[var(--muted-foreground)]">
                    No expenses added yet. Start tracking your budget!
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">Item</th>
                          <th className="text-left py-3 px-2">Category</th>
                          <th className="text-left py-3 px-2">Event</th>
                          <th className="text-right py-3 px-2">Planned</th>
                          <th className="text-right py-3 px-2">Actual</th>
                          <th className="text-right py-3 px-2">Paid</th>
                          <th className="text-right py-3 px-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => {
                          const category = categories.find(c => c.id === item.category_id)
                          return (
                            <tr key={item.id} className="border-b hover:bg-[var(--muted)]">
                              <td className="py-3 px-2">
                                <div className="font-medium">{item.name}</div>
                                {item.vendor && (
                                  <div className="text-xs text-[var(--muted-foreground)]">{item.vendor}</div>
                                )}
                              </td>
                              <td className="py-3 px-2 text-[var(--muted-foreground)]">
                                {category?.name}
                              </td>
                              <td className="py-3 px-2 text-[var(--muted-foreground)]">
                                {item.event_name || '-'}
                              </td>
                              <td className="py-3 px-2 text-right">{formatCurrency(item.planned)}</td>
                              <td className="py-3 px-2 text-right">{formatCurrency(item.actual)}</td>
                              <td className="py-3 px-2 text-right text-[var(--success)]">
                                {formatCurrency(item.paid)}
                              </td>
                              <td className="py-3 px-2 text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditDialog(item)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteItem(item.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
