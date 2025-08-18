"use client"

import { useState, useMemo } from "react"
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
} from "lucide-react"
import React from "react"

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
  const [selectedRows, setSelectedRows] = useState(new Set<string>())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null)
  const [groupColumn, setGroupColumn] = useState<string | null>(null)
  const [filters, setFilters] = useState<Record<string, string>>({})

  const primaryKey = config.primaryKey || 'id'

  // Initialize filters
  React.useEffect(() => {
    const initialFilters: Record<string, string> = {}
    config.columns.forEach(col => {
      if (col.filterable !== false) {
        initialFilters[col.key] = ""
      }
    })
    setFilters(prev => ({ ...initialFilters, ...prev }))
  }, [config.columns])

  // Handle sorting
  const handleSort = (column: string) => {
    const columnConfig = config.columns.find(col => col.key === column)
    if (columnConfig?.sortable === false) return

    if (sortColumn !== column) {
      setSortColumn(column)
      setSortDirection("asc")
    } else if (sortDirection === "asc") {
      setSortDirection("desc")
    } else if (sortDirection === "desc") {
      setSortColumn(null)
      setSortDirection(null)
    } else {
      setSortDirection("asc")
    }
  }

  // Handle grouping
  const handleGroup = (column: string) => {
    const columnConfig = config.columns.find(col => col.key === column)
    if (columnConfig?.groupable === false) return

    setGroupColumn(prev => prev === column ? null : column)
  }

  // Handle filtering
  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    const clearedFilters: Record<string, string> = {}
    config.columns.forEach(col => {
      if (col.filterable !== false) {
        clearedFilters[col.key] = ""
      }
    })
    setFilters(clearedFilters)
    setCurrentPage(1)
  }

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(data.map(item => String(item[primaryKey]))))
    }
  }

  const handleSelectRow = (itemId: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedRows(newSelected)
  }

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
        
        return String(itemValue).toLowerCase().includes(filterValue)
      })
    })
  }, [data, filters, config.columns])

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]
      
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return sortDirection === "asc" ? 1 : -1
      if (bValue == null) return sortDirection === "asc" ? -1 : 1
      
      if (aValue instanceof Date || bValue instanceof Date || 
          (typeof aValue === 'string' && /^\d{4}-\d{2}-\d{2}/.test(aValue))) {
        const aTime = new Date(aValue).getTime()
        const bTime = new Date(bValue).getTime()
        return sortDirection === "asc" ? aTime - bTime : bTime - aTime
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }
      
      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()
      
      if (aStr < bStr) return sortDirection === "asc" ? -1 : 1
      if (aStr > bStr) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [filteredData, sortColumn, sortDirection])

  const groupedData = useMemo(() => {
    if (!groupColumn) return null

    const groups = sortedData.reduce((acc, item) => {
      const groupKey = String(item[groupColumn] || "Unknown")
      
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
  }, [sortedData, groupColumn])

  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = groupColumn ? sortedData : sortedData.slice(startIndex, endIndex)

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4" />
    if (sortDirection === "asc") return <ArrowUp className="h-4 w-4" />
    if (sortDirection === "desc") return <ArrowDown className="h-4 w-4" />
    return <ArrowUpDown className="h-4 w-4" />
  }

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
      return new Date(value).toLocaleDateString()
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
        <div className="overflow-auto max-h-[600px]">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b bg-muted/50 sticky top-0 z-10">
              <tr className="border-b transition-colors hover:bg-muted/50">
                {enableSelection && (
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-12">
                    <Checkbox
                      checked={selectedRows.size === data.length && data.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                )}
                {config.columns.map(col => (
                  <th
                    key={col.key}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground border-r border-border/50"
                    style={{ width: col.width || 150, minWidth: col.minWidth || 80 }}
                  >
                    <div className="flex items-center gap-2">
                      {col.sortable !== false ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                          onClick={() => handleSort(col.key)}
                        >
                          {col.label}
                          {getSortIcon(col.key)}
                        </Button>
                      ) : (
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
                      {groupColumn === col.key && (
                        <Badge variant="secondary" className="text-xs">
                          Grouped
                        </Badge>
                      )}
                    </div>
                  </th>
                ))}
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
      {!groupColumn && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 25, 50, 100].map(size => (
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
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
