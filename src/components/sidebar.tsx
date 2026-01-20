"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  CalendarDays,
  DollarSign,
  Users,
  CheckSquare,
  MapPin,
  ImageIcon,
  Store,
  LayoutGrid,
  Clock,
  Calendar,
  LogOut,
  Menu,
  X
} from "lucide-react"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "To-Do List", href: "/todos", icon: CheckSquare },
  { name: "Budget", href: "/budget", icon: DollarSign },
  { name: "Guests", href: "/guests", icon: Users },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Seating", href: "/seating", icon: MapPin },
  { name: "Vision Board", href: "/vision-board", icon: ImageIcon },
  { name: "Vendors", href: "/vendors", icon: Store },
  { name: "Wedding Party", href: "/wedding-party", icon: Users },
  { name: "Itinerary", href: "/itinerary", icon: Clock },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-[var(--card)] border-r transform transition-transform duration-200 ease-in-out md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b">
            <div className="w-10 h-10 rounded bg-[var(--primary)] flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold" style={{ color: 'var(--primary)' }}>
                Wedding Planner
              </h1>
              <p className="text-xs text-[var(--muted-foreground)]">Feb 2-6, 2027</p>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="px-3 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>

          {/* Sign out button */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-[var(--muted-foreground)]"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
