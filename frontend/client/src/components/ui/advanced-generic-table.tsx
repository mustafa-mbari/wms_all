"use client"

import { useState, useMemo, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  Sun,
  Moon,
} from "lucide-react"
import React from "react"

type SortDirection = "asc" | "desc" | null

export interface ColumnConfig<T = any> {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  groupable?: boolean
  width?: number
  minWidth?: number
  render?: (item: T) => React.ReactNode
  filterType?: "text" | "select" | "date" | "boolean"
  filterOptions?: Array<{ value: string; label: string }>
}

export interface TableConfig<T = any> {
  columns: ColumnConfig<T>[]
  entityName: string
  entityNamePlural: string
  primaryKey?: string
}

interface SortConfig {
  column: string | null
  direction: SortDirection
}

interface GroupConfig {
  column: string | null
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

interface AdvancedGenericTableProps<T = any> {
  data: T[]
  config: TableConfig<T>
  loading?: boolean
  onItemSelect?: (itemIds: string[]) => void
  onBulkAction?: (action: string, itemIds: string[]) => void
  onItemEdit?: (item: T) => void
  onItemDelete?: (item: T) => void
  onItemView?: (item: T) => void
  enableSelection?: boolean
  enableBulkActions?: boolean
  enableExport?: boolean
  customActions?: Array<{
    key: string
    label: string
    icon?: React.ReactNode
    onClick: (item: T) => void
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  }>
  bulkActions?: Array<{
    key: string
    label: string
    icon?: React.ReactNode
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  }>
}

export function AdvancedGenericTable<T extends Record<string, any>>({
  data = [],
  config,
  loading = false,
  onItemSelect,
  onBulkAction,
  onItemEdit,
  onItemDelete,
  onItemView,
  enableSelection = true,
  enableBulkActions = true,
  enableExport = true,
  customActions = [],
  bulkActions = [],
}: AdvancedGenericTableProps<T>) {
  // Simple theme state (can be replaced with actual theme provider later)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  // State
  const [selectedRows, setSelectedRows] = useState(new Set<string>())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: null, direction: null })
  const [groupConfig, setGroupConfig] = useState<GroupConfig>({ column: null })
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [isResizing, setIsResizing] = useState(false)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const initialWidths: Record<string, number> = {}
    config.columns.forEach(col => {
      initialWidths[col.key] = col.width || 150
    })
    return initialWidths
  })

  const tableRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const startWidth = useRef(0)
  const currentColumn = useRef<string>("")

  const primaryKey = config.primaryKey || 'id'

  // Initialize filters object with all filterable columns
  useMemo(() => {
    const initialFilters: Record<string, string> = {}
    config.columns.forEach(col => {
      if (col.filterable !== false) {
        initialFilters[col.key] = ""
      }
    })
    setFilters(prev => ({ ...initialFilters, ...prev }))
  }, [config.columns])

  // Resize handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, column: string) => {
    setIsResizing(true)
    currentColumn.current = column
    startX.current = e.clientX
    startWidth.current = columnWidths[column]
    
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    e.preventDefault()
  }, [columnWidths])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return
    
    const deltaX = e.clientX - startX.current
    const newWidth = Math.max(80, startWidth.current + deltaX)
    
    setColumnWidths(prev => ({
      ...prev,
      [currentColumn.current]: newWidth
    }))
  }, [isResizing])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
  }, [handleMouseMove])

  // Selection handlers
  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(data.map(item => String(item[primaryKey]))))
    }
  }, [data, selectedRows.size, primaryKey])

  const handleSelectRow = useCallback((itemId: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedRows(newSelected)
  }, [selectedRows])

  // Sorting
  const handleSort = useCallback((column: string) => {
    const columnConfig = config.columns.find(col => col.key === column)
    if (columnConfig?.sortable === false) return

    setSortConfig(prev => {
      if (prev.column !== column) {
        return { column, direction: "asc" }
      }
      if (prev.direction === "asc") {
        return { column, direction: "desc" }
      }
      if (prev.direction === "desc") {
        return { column: null, direction: null }
      }
      return { column, direction: "asc" }
    })
  }, [config.columns])

  // Grouping
  const handleGroup = useCallback((column: string) => {
    const columnConfig = config.columns.find(col => col.key === column)
    if (columnConfig?.groupable === false) return

    setGroupConfig(prev => ({
      column: prev.column === column ? null : column
    }))
  }, [config.columns])

  // Filtering
  const handleFilterChange = useCallback((column: string, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }))
    setCurrentPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    const clearedFilters: Record<string, string> = {}
    config.columns.forEach(col => {
      if (col.filterable !== false) {
        clearedFilters[col.key] = ""
      }
    })
    setFilters(clearedFilters)
    setCurrentPage(1)
  }, [config.columns])

  // Data processing
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return config.columns.every(col => {
        if (col.filterable === false || !filters[col.key]) return true
        
        const itemValue = item[col.key]
        const filterValue = filters[col.key].toLowerCase()
        
        if (itemValue == null) return false
        
        if (col.filterType === "boolean") {
          const boolValue = Boolean(itemValue)
          return (filterValue === "true" && boolValue) || (filterValue === "false" && !boolValue)
        }
        
        if (col.filterType === "select" && col.filterOptions) {
          return String(itemValue).toLowerCase().includes(filterValue)
        }
        
        return String(itemValue).toLowerCase().includes(filterValue)
      })
    })
  }, [data, filters, config.columns])

  const sortedData = useMemo(() => {
    if (!sortConfig.column || !sortConfig.direction) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.column!]
      const bValue = b[sortConfig.column!]
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return sortConfig.direction === "asc" ? 1 : -1
      if (bValue == null) return sortConfig.direction === "asc" ? -1 : 1
      
      // Handle dates
      if (aValue instanceof Date || bValue instanceof Date || 
          (typeof aValue === 'string' && /^\d{4}-\d{2}-\d{2}/.test(aValue))) {
        const aTime = new Date(aValue).getTime()
        const bTime = new Date(bValue).getTime()
        return sortConfig.direction === "asc" ? aTime - bTime : bTime - aTime
      }
      
      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
      }
      
      // Handle strings
      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()
      
      if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1
      if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })
  }, [filteredData, sortConfig])

  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = groupConfig.column ? sortedData : sortedData.slice(startIndex, endIndex)

  const selectedItems = useMemo(() => {
    return data.filter((item) => selectedRows.has(String(item[primaryKey])))
  }, [data, selectedRows, primaryKey])

  const groupedData = useMemo(() => {
    if (!groupConfig.column) return null

    const groups = sortedData.reduce((acc, item) => {
      const groupKey = String(item[groupConfig.column!] || "Unknown")
      
      if (!acc[groupKey]) {
        acc[groupKey] = []
      }
      acc[groupKey].push(item)
      return acc
    }, {} as Record<string, T[]>)

    return Object.entries(groups).map(([key, items]) => ({
      key,
      items,
      count: items.length
    }))
  }, [sortedData, groupConfig.column])

  const getSortIcon = (column: string) => {
    if (sortConfig.column !== column) return <ArrowUpDown className="h-4 w-4" />
    if (sortConfig.direction === "asc") return <ArrowUp className="h-4 w-4" />
    if (sortConfig.direction === "desc") return <ArrowDown className="h-4 w-4" />
    return <ArrowUpDown className="h-4 w-4" />
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const renderColumnHeader = (col: ColumnConfig<T>) => (
    <th
      key={col.key}
      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground relative border-r border-border/50"
      style={{ width: columnWidths[col.key], minWidth: col.minWidth || 80 }}
    >
      <div className="flex items-center gap-2">
        {col.sortable !== false && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
            onClick={() => handleSort(col.key)}
          >
            {col.label}
            {getSortIcon(col.key)}
          </Button>
        )}
        {col.sortable === false && (
          <span className="font-medium">{col.label}</span>
        )}
        {col.groupable !== false && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-muted-foreground hover:text-foreground"
            onClick={() => handleGroup(col.key)}
            title={`Group by ${col.label}`}
          >
            <Users className="h-3 w-3" />
          </Button>
        )}
        {groupConfig.column === col.key && (
          <Badge variant="secondary" className="text-xs">
            Grouped
          </Badge>
        )}
      </div>
      <div
        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors"
        onMouseDown={(e) => handleMouseDown(e, col.key)}
        title="Drag to resize column"
      />
    </th>
  )

  const renderCell = (item: T, col: ColumnConfig<T>) => {
    if (col.render) {
      return col.render(item)
    }
    
    const value = item[col.key]
    
    if (value == null) return <span className="text-muted-foreground">-</span>
    
    if (typeof value === 'boolean') {
      return <Badge variant={value ? "default" : "secondary"}>{value ? "Yes" : "No"}</Badge>
    }
    
    if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))) {
      return formatDate(value)
    }
    
    return String(value)
  }

  const renderFilterInput = (col: ColumnConfig<T>) => {
    if (col.filterable === false) return null

    if (col.filterType === "select" && col.filterOptions) {
      return (
        <Select value={filters[col.key]} onValueChange={(value) => handleFilterChange(col.key, value)}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            {col.filterOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (col.filterType === "boolean") {
      return (
        <Select value={filters[col.key]} onValueChange={(value) => handleFilterChange(col.key, value)}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      )
    }

    return (
      <Input
        placeholder={`Filter ${col.label.toLowerCase()}...`}
        value={filters[col.key]}
        onChange={(e) => handleFilterChange(col.key, e.target.value)}
        className="h-8"
      />
    )
  }

  // Effect for selection callback
  React.useEffect(() => {
    if (onItemSelect) {
      onItemSelect(Array.from(selectedRows))
    }
  }, [selectedRows, onItemSelect])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{config.entityNamePlural}</h3>
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} {config.entityNamePlural.toLowerCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Filters</CardTitle>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {config.columns.map(col => (
              col.filterable !== false && (
                <div key={col.key} className="space-y-2">
                  <label className="text-sm font-medium">{col.label}</label>
                  {renderFilterInput(col)}
                </div>
              )
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {enableBulkActions && selectedRows.size > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                {selectedRows.size} {config.entityName.toLowerCase()}{selectedRows.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                {bulkActions.map(action => (
                  <Button
                    key={action.key}
                    variant={action.variant || "outline"}
                    size="sm"
                    onClick={() => onBulkAction?.(action.key, Array.from(selectedRows))}
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <div ref={tableRef} className="overflow-auto max-h-[600px]">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b bg-muted/50 sticky top-0 z-10">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                {enableSelection && (
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-12">
                    <Checkbox
                      checked={selectedRows.size === data.length && data.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                )}
                {config.columns.map(renderColumnHeader)}
                {(customActions.length > 0 || onItemEdit || onItemDelete || onItemView) && (
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-20">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {loading ? (
                <tr>
                  <td colSpan={config.columns.length + (enableSelection ? 1 : 0) + 1} className="h-24 text-center">
                    Loading...
                  </td>
                </tr>
              ) : groupedData ? (
                groupedData.map(group => (
                  <React.Fragment key={group.key}>
                    <tr className="bg-muted/30">
                      <td colSpan={config.columns.length + (enableSelection ? 1 : 0) + 1} className="px-4 py-2 font-medium">
                        {group.key} ({group.count} {group.count === 1 ? config.entityName.toLowerCase() : config.entityNamePlural.toLowerCase()})
                      </td>
                    </tr>
                    {group.items.map(item => (
                      <tr
                        key={String(item[primaryKey])}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        data-state={selectedRows.has(String(item[primaryKey])) ? "selected" : ""}
                      >
                        {enableSelection && (
                          <td className="p-4 align-middle">
                            <Checkbox
                              checked={selectedRows.has(String(item[primaryKey]))}
                              onCheckedChange={() => handleSelectRow(String(item[primaryKey]))}
                              aria-label={`Select ${config.entityName.toLowerCase()}`}
                            />
                          </td>
                        )}
                        {config.columns.map(col => (
                          <td key={col.key} className="p-4 align-middle">
                            {renderCell(item, col)}
                          </td>
                        ))}
                        {(customActions.length > 0 || onItemEdit || onItemDelete || onItemView) && (
                          <td className="p-4 align-middle">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                {onItemView && (
                                  <DropdownMenuItem onClick={() => onItemView(item)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                  </DropdownMenuItem>
                                )}
                                {onItemEdit && (
                                  <DropdownMenuItem onClick={() => onItemEdit(item)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                )}
                                {customActions.map(action => (
                                  <DropdownMenuItem key={action.key} onClick={() => action.onClick(item)}>
                                    {action.icon && <span className="mr-2">{action.icon}</span>}
                                    {action.label}
                                  </DropdownMenuItem>
                                ))}
                                {onItemDelete && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => onItemDelete(item)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        )}
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length + (enableSelection ? 1 : 0) + 1} className="h-24 text-center">
                    No {config.entityNamePlural.toLowerCase()} found.
                  </td>
                </tr>
              ) : (
                paginatedData.map(item => (
                  <tr
                    key={String(item[primaryKey])}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    data-state={selectedRows.has(String(item[primaryKey])) ? "selected" : ""}
                  >
                    {enableSelection && (
                      <td className="p-4 align-middle">
                        <Checkbox
                          checked={selectedRows.has(String(item[primaryKey]))}
                          onCheckedChange={() => handleSelectRow(String(item[primaryKey]))}
                          aria-label={`Select ${config.entityName.toLowerCase()}`}
                        />
                      </td>
                    )}
                    {config.columns.map(col => (
                      <td key={col.key} className="p-4 align-middle">
                        {renderCell(item, col)}
                      </td>
                    ))}
                    {(customActions.length > 0 || onItemEdit || onItemDelete || onItemView) && (
                      <td className="p-4 align-middle">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {onItemView && (
                              <DropdownMenuItem onClick={() => onItemView(item)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                            )}
                            {onItemEdit && (
                              <DropdownMenuItem onClick={() => onItemEdit(item)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {customActions.map(action => (
                              <DropdownMenuItem key={action.key} onClick={() => action.onClick(item)}>
                                {action.icon && <span className="mr-2">{action.icon}</span>}
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                            {onItemDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onItemDelete(item)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!groupConfig.column && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {PAGE_SIZE_OPTIONS.map(size => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
