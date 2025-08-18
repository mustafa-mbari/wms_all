"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Settings, Eye, EyeOff } from "lucide-react"
import { ColumnVisibility } from "@/hooks/use-table-settings"

interface ColumnSettingsDialogProps {
  columnVisibility: ColumnVisibility
  onColumnVisibilityChange: (visibility: ColumnVisibility) => void
}

const columnLabels: Record<keyof ColumnVisibility, string> = {
  name: "Name",
  email: "Email",
  roles: "Roles",
  phone: "Phone",
  status: "Status",
  lastLogin: "Last Login",
  created: "Created",
  actions: "Actions",
}

export function ColumnSettingsDialog({ columnVisibility, onColumnVisibilityChange }: ColumnSettingsDialogProps) {
  const [open, setOpen] = useState(false)

  const handleColumnToggle = (column: keyof ColumnVisibility, checked: boolean) => {
    onColumnVisibilityChange({
      ...columnVisibility,
      [column]: checked,
    })
  }

  const showAllColumns = () => {
    const allVisible = Object.keys(columnVisibility).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as ColumnVisibility,
    )
    onColumnVisibilityChange(allVisible)
  }

  const hideAllColumns = () => {
    const allHidden = Object.keys(columnVisibility).reduce(
      (acc, key) => ({ ...acc, [key]: false }),
      {} as ColumnVisibility,
    )
    onColumnVisibilityChange(allHidden)
  }

  const visibleCount = Object.values(columnVisibility).filter(Boolean).length
  const totalCount = Object.keys(columnVisibility).length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Table Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Table Column Settings</DialogTitle>
          <DialogDescription>
            Choose which columns to display in the table. You can show or hide columns as needed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {visibleCount} of {totalCount} columns visible
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={showAllColumns}>
                <Eye className="h-4 w-4 mr-1" />
                Show All
              </Button>
              <Button variant="outline" size="sm" onClick={hideAllColumns}>
                <EyeOff className="h-4 w-4 mr-1" />
                Hide All
              </Button>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(columnLabels).map(([column, label]) => (
              <div key={column} className="flex items-center space-x-2">
                <Checkbox
                  id={column}
                  checked={columnVisibility[column as keyof ColumnVisibility]}
                  onCheckedChange={(checked) =>
                    handleColumnToggle(column as keyof ColumnVisibility, checked as boolean)
                  }
                />
                <Label
                  htmlFor={column}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
