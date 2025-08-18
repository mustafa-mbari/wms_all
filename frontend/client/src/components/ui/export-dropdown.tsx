"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, FileSpreadsheet, FileImage } from "lucide-react"
import type { UserData } from "@/lib/export-utils"
import { exportToCSV, exportToExcel, exportToPDF } from "@/lib/export-utils"

interface ExportDropdownProps {
  data: UserData[]
  selectedData?: UserData[]
  disabled?: boolean
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  filename?: string
}

export function ExportDropdown({ 
  data, 
  selectedData, 
  disabled = false, 
  variant = "default",
  size = "default",
  filename = "users"
}: ExportDropdownProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: "csv" | "excel" | "pdf", useSelected = false) => {
    setIsExporting(true)

    try {
      const exportData = useSelected && selectedData ? selectedData : data
      const timestamp = new Date().toISOString().split("T")[0]
      const prefix = useSelected ? `selected-${filename}` : filename

      switch (format) {
        case "csv":
          exportToCSV(exportData, `${prefix}-${timestamp}.csv`)
          break
        case "excel":
          exportToExcel(exportData, `${prefix}-${timestamp}.xlsx`)
          break
        case "pdf":
          exportToPDF(exportData, `${prefix}-${timestamp}.pdf`)
          break
      }
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const hasSelection = selectedData && selectedData.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={disabled || isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileImage className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>

        {hasSelection && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport("csv", true)}>
              <FileText className="h-4 w-4 mr-2" />
              Export Selected as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("excel", true)}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Selected as Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("pdf", true)}>
              <FileImage className="h-4 w-4 mr-2" />
              Export Selected as PDF
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
