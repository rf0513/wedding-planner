"use client"

import { Sidebar } from "./sidebar"
import { SessionProvider } from "next-auth/react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-[var(--background)]">
        <Sidebar />
        <main className="md:pl-64">
          <div className="p-4 md:p-8 pt-20 md:pt-8">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  )
}
