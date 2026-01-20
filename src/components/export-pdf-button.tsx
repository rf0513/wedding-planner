"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface ExportPdfButtonProps {
  title?: string
}

export function ExportPdfButton({ title = "Export PDF" }: ExportPdfButtonProps) {
  const handleExport = () => {
    window.print()
  }

  return (
    <Button variant="outline" onClick={handleExport} className="no-print">
      <Printer className="w-4 h-4 mr-2" />
      {title}
    </Button>
  )
}
