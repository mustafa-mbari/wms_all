"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import {
  ChevronDown,
  Search,
  Settings,
  Filter,
  Users,
  ChevronRight,
  Eye,
  EyeOff,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Input } from "./input"
import { Checkbox } from "./checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"

// Types
export interface ColumnDef<T = any> {
  id: string
  header: string
  accessorKey?: string
  cell?: (value: any, row: T) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string | number
}

interface GroupedData<T> {
  groupKey: string
  groupValue: any
  data: T[]
  isGroup: true
}

interface UngroupedData<T> {
  data: T[]
  isGroup: false
}

export interface AdvancedTableProps<T = any> {
  data: T[]
  columns: ColumnDef<T>[]
  className?: string
  onRowClick?: (row: T) => void
  searchable?: boolean
  groupable?: boolean
  sortable?: boolean
  pagination?: boolean
  pageSize?: number
}

// Column filter component
const ColumnFilter: React.FC<{
  column: ColumnDef
  value: string
  onChange: (value: string) => void
  onClear: () => void
}> = ({ column, value, onChange, onClear }) => {
  return (
    <div className="relative flex items-center gap-1">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder={`Filter ${column.header.toLowerCase()}...`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 pl-7 pr-8 text-xs"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={onClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}

// Group header component
const GroupHeader: React.FC<{
  groupKey: string
  groupValue: any
  count: number
  isExpanded: boolean
  onToggle: () => void
}> = ({ groupKey, groupValue, count, isExpanded, onToggle }) => {
  return (
    <TableRow className="bg-muted/30 hover:bg-muted/50 border-b-2 border-muted">
      <TableCell colSpan={100} className="font-medium">
        <div className="flex items-center gap-2 py-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onToggle}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <strong>{groupKey}:</strong> {groupValue || "(Empty)"}
          </span>
          <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {count} {count === 1 ? "item" : "items"}
          </span>
        </div>
      </TableCell>
    </TableRow>
  )
}

// Column settings dialog component
const ColumnSettings: React.FC<{
  columns: ColumnDef[]
  visibleColumns: Set<string>
  onToggleColumn: (columnId: string) => void
}> = ({ columns, visibleColumns, onToggleColumn }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Table Columns Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Table Columns Settings</DialogTitle>
          <DialogDescription>
            Choose which columns to display in the table.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {columns.map((column) => (
            <div key={column.id} className="flex items-center space-x-3">
              <Checkbox
                id={column.id}
                checked={visibleColumns.has(column.id)}
                onCheckedChange={() => onToggleColumn(column.id)}
              />
              <label
                htmlFor={column.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                {visibleColumns.has(column.id) ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                {column.header}
              </label>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Main AdvancedTable component
export const AdvancedTable = <T extends Record<string, any>>({
  data,
  columns,
  className,
  onRowClick,
  searchable = true,
  groupable = true,
  sortable = true,
  pagination = false,
  pageSize = 10,
}: AdvancedTableProps<T>) => {
  // State management
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})
  const [groupBy, setGroupBy] = useState<string | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map((col) => col.id))
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Helper functions
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  const handleColumnFilter = (columnId: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnId]: value,
    }))
  }

  const clearColumnFilter = (columnId: string) => {
    setColumnFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[columnId]
      return newFilters
    })
  }

  const handleGroupBy = (columnId: string) => {
    setGroupBy(groupBy === columnId ? null : columnId)
    setExpandedGroups(new Set())
  }

  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      // Toggle sort order if same column
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      // Set new sort column
      setSortBy(columnId)
      setSortOrder("asc")
    }
  }

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey)
      } else {
        newSet.add(groupKey)
      }
      return newSet
    })
  }

  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(columnId)) {
        newSet.delete(columnId)
      } else {
        newSet.add(columnId)
      }
      return newSet
    })
  }

  // Filter visible columns
  const filteredColumns = columns.filter((col) => visibleColumns.has(col.id))

  // Process data with filters, sorting, and grouping
  const processedData = useMemo((): (GroupedData<T> | UngroupedData<T>)[] => {
    let filtered = data

    // Apply column filters
    Object.entries(columnFilters).forEach(([columnId, filterValue]) => {
      if (filterValue) {
        const column = columns.find((col) => col.id === columnId)
        if (column?.accessorKey) {
          filtered = filtered.filter((row) => {
            const value = getNestedValue(row, column.accessorKey!)
            return String(value || "")
              .toLowerCase()
              .includes(filterValue.toLowerCase())
          })
        }
      }
    })

    // Apply sorting
    if (sortBy) {
      const sortColumn = columns.find((col) => col.id === sortBy)
      if (sortColumn?.accessorKey) {
        filtered = [...filtered].sort((a, b) => {
          const aValue = getNestedValue(a, sortColumn.accessorKey!)
          const bValue = getNestedValue(b, sortColumn.accessorKey!)
          
          // Handle null/undefined values
          if (aValue == null && bValue == null) return 0
          if (aValue == null) return sortOrder === "asc" ? 1 : -1
          if (bValue == null) return sortOrder === "asc" ? -1 : 1
          
          // Convert to strings for comparison
          const aStr = String(aValue).toLowerCase()
          const bStr = String(bValue).toLowerCase()
          
          if (aStr < bStr) return sortOrder === "asc" ? -1 : 1
          if (aStr > bStr) return sortOrder === "asc" ? 1 : -1
          return 0
        })
      }
    }

    // Group data if groupBy is set
    if (groupBy) {
      const groupColumn = columns.find((col) => col.id === groupBy)
      if (groupColumn?.accessorKey) {
        const groups: Record<string, T[]> = {}
        
        filtered.forEach((row) => {
          const groupValue = getNestedValue(row, groupColumn.accessorKey!)
          const groupKey = String(groupValue || "(Empty)")
          if (!groups[groupKey]) {
            groups[groupKey] = []
          }
          groups[groupKey].push(row)
        })

        return Object.entries(groups).map(([groupKey, groupData]): GroupedData<T> => ({
          groupKey,
          groupValue: groupKey,
          data: groupData,
          isGroup: true,
        }))
      }
    }

    return [{ data: filtered, isGroup: false } as UngroupedData<T>]
  }, [data, columnFilters, groupBy, columns, sortBy, sortOrder])

  // Pagination logic
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData

    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize

    if (groupBy) {
      return processedData.slice(startIndex, endIndex)
    } else {
      const flatData = processedData[0]?.data || []
      return [{ data: flatData.slice(startIndex, endIndex), isGroup: false }]
    }
  }, [processedData, currentPage, pageSize, pagination, groupBy])

  const totalPages = Math.ceil(
    (groupBy ? processedData.length : (processedData[0]?.data?.length || 0)) / pageSize
  )

  return (
    <div className="space-y-4">
      {/* Table controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ColumnSettings
            columns={columns}
            visibleColumns={visibleColumns}
            onToggleColumn={toggleColumnVisibility}
          />
          
          {groupable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {groupBy ? `Grouped by ${columns.find(c => c.id === groupBy)?.header}` : "Group By"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setGroupBy(null)}>
                  No Grouping
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {columns.map((column) => (
                  <DropdownMenuItem
                    key={column.id}
                    onClick={() => handleGroupBy(column.id)}
                    className={groupBy === column.id ? "bg-accent" : ""}
                  >
                    {column.header}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {pagination && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className={cn(
        "rounded-lg border shadow-sm bg-background",
        className
      )}>
        <Table>
          <TableHeader>
            <TableRow className="border-b">
              {filteredColumns.map((column) => (
                <TableHead
                  key={column.id}
                  style={{ width: column.width }}
                  className="px-4 py-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{column.header}</span>
                      {column.sortable !== false && column.accessorKey && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleSort(column.id)}
                          title={`Sort by ${column.header}`}
                        >
                          {sortBy === column.id ? (
                            sortOrder === "asc" ? (
                              <ArrowUp className="h-3 w-3 text-primary" />
                            ) : (
                              <ArrowDown className="h-3 w-3 text-primary" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                      )}
                      {groupable && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleGroupBy(column.id)}
                          title={`Group by ${column.header}`}
                        >
                          <Users className={cn(
                            "h-3 w-3",
                            groupBy === column.id ? "text-primary" : "text-muted-foreground"
                          )} />
                        </Button>
                      )}
                    </div>
                    {searchable && column.filterable !== false && (
                      <ColumnFilter
                        column={column}
                        value={columnFilters[column.id] || ""}
                        onChange={(value) => handleColumnFilter(column.id, value)}
                        onClear={() => clearColumnFilter(column.id)}
                      />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={filteredColumns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((group, groupIndex) => {
                if (group.isGroup && groupBy) {
                  const groupedData = group as GroupedData<T>
                  const isExpanded = expandedGroups.has(groupedData.groupKey)
                  return (
                    <React.Fragment key={groupedData.groupKey}>
                      <GroupHeader
                        groupKey={columns.find(c => c.id === groupBy)?.header || ""}
                        groupValue={groupedData.groupValue}
                        count={groupedData.data.length}
                        isExpanded={isExpanded}
                        onToggle={() => toggleGroup(groupedData.groupKey)}
                      />
                      {isExpanded &&
                        groupedData.data.map((row, rowIndex) => (
                          <TableRow
                            key={`${groupedData.groupKey}-${rowIndex}`}
                            className={cn(
                              "hover:bg-muted/50 cursor-pointer transition-colors",
                              onRowClick && "cursor-pointer"
                            )}
                            onClick={() => onRowClick?.(row)}
                          >
                            {filteredColumns.map((column) => (
                              <TableCell key={column.id} className="px-4 py-3">
                                {column.cell
                                  ? column.cell(
                                      column.accessorKey ? getNestedValue(row, column.accessorKey) : row,
                                      row
                                    )
                                  : column.accessorKey
                                  ? String(getNestedValue(row, column.accessorKey) || "")
                                  : ""}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                    </React.Fragment>
                  )
                } else {
                  const ungroupedData = group as UngroupedData<T>
                  return ungroupedData.data.map((row, rowIndex) => (
                    <TableRow
                      key={rowIndex}
                      className={cn(
                        "hover:bg-muted/50 transition-colors",
                        onRowClick && "cursor-pointer"
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {filteredColumns.map((column) => (
                        <TableCell key={column.id} className="px-4 py-3">
                          {column.cell
                            ? column.cell(
                                column.accessorKey ? getNestedValue(row, column.accessorKey) : row,
                                row
                              )
                            : column.accessorKey
                            ? String(getNestedValue(row, column.accessorKey) || "")
                            : ""}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                }
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default AdvancedTable
