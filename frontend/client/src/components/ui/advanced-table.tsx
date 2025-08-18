"use client"

import React, { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Button } from "./button"
import { Input } from "./input"
import { Badge } from "./badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import { Checkbox } from "./checkbox"
import { cn } from "../../lib/utils"
import {
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
  UserPlus,
  Settings,
  MoreHorizontal,
  Edit,
  Trash2,
  X,
  ChevronDown
} from "lucide-react"

// Types
export interface ColumnDef {
  id: string
  header: string
  accessorKey?: string
  cell?: (value: any, row: any) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string
}

export interface User {
  id: number
  name: string
  email: string
  role_names: string[]
  status: string
  created_at: string
  last_login: string | null
  permissions?: string[]
}

export interface AdvancedUserTableProps {
  data: User[]
  onAddUser?: () => void
  onEditUser?: (user: User) => void
  onDeleteUser?: (user: User) => void
  onUserClick?: (user: User) => void
  className?: string
}

type SortDirection = "asc" | "desc"

// Custom hook for filtering logic
const useTableFilters = (data: User[], columns: ColumnDef[]) => {
  const [searchValue, setSearchValue] = useState("")
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})

  const filteredData = useMemo(() => {
    let filtered = [...data]

    // Apply search filter
    if (searchValue.trim()) {
      filtered = filtered.filter(row =>
        columns.some(column => {
          if (!column.accessorKey) return false
          const value = row[column.accessorKey as keyof User]
          return String(value || "").toLowerCase().includes(searchValue.toLowerCase())
        })
      )
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([columnId, filterValue]) => {
      if (filterValue.trim()) {
        const column = columns.find(col => col.id === columnId)
        if (column?.accessorKey) {
          filtered = filtered.filter(row => {
            const value = row[column.accessorKey as keyof User]
            return String(value || "").toLowerCase().includes(filterValue.toLowerCase())
          })
        }
      }
    })

    return filtered
  }, [data, searchValue, columnFilters, columns])

  const setColumnFilter = useCallback((columnId: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnId]: value
    }))
  }, [])

  const clearColumnFilter = useCallback((columnId: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[columnId]
      return newFilters
    })
  }, [])

  return {
    searchValue,
    setSearchValue,
    columnFilters,
    setColumnFilter,
    clearColumnFilter,
    filteredData
  }
}

// Custom hook for sorting logic
const useTableSorting = (data: User[], columns: ColumnDef[]) => {
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const sortedData = useMemo(() => {
    if (!sortBy) return data

    const column = columns.find(col => col.id === sortBy)
    if (!column?.accessorKey) return data

    return [...data].sort((a, b) => {
      const aValue = a[column.accessorKey as keyof User]
      const bValue = b[column.accessorKey as keyof User]

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return 1
      if (bValue == null) return -1

      // Handle arrays (like role_names)
      if (Array.isArray(aValue) && Array.isArray(bValue)) {
        const aStr = aValue.join(", ").toLowerCase()
        const bStr = bValue.join(", ").toLowerCase()
        const result = aStr.localeCompare(bStr)
        return sortDirection === "asc" ? result : -result
      }

      // Handle strings and other types
      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()
      const result = aStr.localeCompare(bStr)
      return sortDirection === "asc" ? result : -result
    })
  }, [data, sortBy, sortDirection, columns])

  const handleSort = useCallback((columnId: string) => {
    if (sortBy === columnId) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortBy(columnId)
      setSortDirection("asc")
    }
  }, [sortBy])

  return {
    sortBy,
    sortDirection,
    sortedData,
    handleSort
  }
}

// Custom hook for pagination
const useTablePagination = (data: User[], initialPageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return data.slice(start, end)
  }, [data, currentPage, pageSize])

  const totalPages = Math.ceil(data.length / pageSize)

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }, [totalPages])

  const goToFirstPage = useCallback(() => goToPage(1), [goToPage])
  const goToLastPage = useCallback(() => goToPage(totalPages), [goToPage, totalPages])
  const goToPreviousPage = useCallback(() => goToPage(currentPage - 1), [goToPage, currentPage])
  const goToNextPage = useCallback(() => goToPage(currentPage + 1), [goToPage, currentPage])

  return {
    currentPage,
    pageSize,
    setPageSize,
    totalPages,
    paginatedData,
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToPreviousPage,
    goToNextPage
  }
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
          className="h-8 pl-7 pr-8"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={onClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}

// Main component
export function AdvancedUserTable({
  data,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onUserClick,
  className
}: AdvancedUserTableProps) {
  // Define columns
  const columns: ColumnDef[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      cell: (value, row) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
      cell: (value) => (
        <div className="text-muted-foreground">{value}</div>
      )
    },
    {
      id: "roles",
      header: "Roles",
      accessorKey: "role_names",
      cell: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {Array.from(new Set(value || [])).map((role, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {role}
            </Badge>
          ))}
        </div>
      ),
      sortable: true
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: (value) => (
        <Badge 
          variant={value === "active" ? "default" : "secondary"}
          className={cn(
            "text-xs",
            value === "active" && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          )}
        >
          {value}
        </Badge>
      )
    },
    {
      id: "created_at",
      header: "Created",
      accessorKey: "created_at",
      cell: (value) => (
        <div className="text-sm text-muted-foreground">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      id: "last_login",
      header: "Last Login",
      accessorKey: "last_login",
      cell: (value) => (
        <div className="text-sm text-muted-foreground">
          {value ? new Date(value).toLocaleDateString() : "Never"}
        </div>
      )
    },
    {
      id: "actions",
      header: "Actions",
      cell: (_, row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditUser?.(row)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDeleteUser?.(row)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      sortable: false,
      filterable: false
    }
  ]

  // Column visibility
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([])
  const visibleColumns = useMemo(() => 
    columns.filter(col => !hiddenColumns.includes(col.id)),
    [hiddenColumns]
  )

  // Use custom hooks
  const {
    searchValue,
    setSearchValue,
    columnFilters,
    setColumnFilter,
    clearColumnFilter,
    filteredData
  } = useTableFilters(data, columns)

  const {
    sortBy,
    sortDirection,
    sortedData,
    handleSort
  } = useTableSorting(filteredData, columns)

  const {
    currentPage,
    pageSize,
    setPageSize,
    totalPages,
    paginatedData,
    goToFirstPage,
    goToLastPage,
    goToPreviousPage,
    goToNextPage
  } = useTablePagination(sortedData, 10)

  // Statistics
  const stats = useMemo(() => {
    const activeUsers = data.filter(user => user.status === "active").length
    const inactiveUsers = data.length - activeUsers
    const roles = Array.from(new Set(data.flatMap(user => user.role_names)))
    
    return {
      total: data.length,
      active: activeUsers,
      inactive: inactiveUsers,
      roles: roles.sort()
    }
  }, [data])

  const toggleColumnVisibility = useCallback((columnId: string) => {
    setHiddenColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    )
  }, [])

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold px-6 pb-6">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold px-6 pb-6">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <div className="h-2 w-2 bg-gray-500 rounded-full" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold px-6 pb-6">{stats.inactive}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
            <Badge variant="secondary">{stats.roles.length}</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-wrap gap-1 px-6 pb-6">
              {stats.roles.slice(0, 3).map((role, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {role}
                </Badge>
              ))}
              {stats.roles.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{stats.roles.length - 3}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-8 min-w-[300px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {columns.map((column) => (
                <DropdownMenuItem key={column.id} asChild>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={column.id}
                      checked={!hiddenColumns.includes(column.id)}
                      onCheckedChange={() => toggleColumnVisibility(column.id)}
                    />
                    <label htmlFor={column.id} className="text-sm font-medium">
                      {column.header}
                    </label>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export
          </Button>

          {onAddUser && (
            <Button onClick={onAddUser} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableHead key={column.id} className="h-12">
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {column.sortable !== false && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0"
                        onClick={() => handleSort(column.id)}
                      >
                        {sortBy === column.id ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
            
            {/* Filter Row */}
            <TableRow className="border-b bg-muted/20">
              {visibleColumns.map((column) => (
                <TableHead key={`filter-${column.id}`} className="h-12">
                  {column.filterable !== false && (
                    <ColumnFilter
                      column={column}
                      value={columnFilters[column.id] || ""}
                      onChange={(value) => setColumnFilter(column.id, value)}
                      onClear={() => clearColumnFilter(column.id)}
                    />
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((user) => (
                <TableRow
                  key={user.id}
                  className={cn(
                    "hover:bg-muted/50 transition-colors",
                    onUserClick && "cursor-pointer"
                  )}
                  onClick={() => onUserClick?.(user)}
                >
                  {visibleColumns.map((column) => (
                    <TableCell key={column.id} className="py-3">
                      {column.cell
                        ? column.cell(
                            column.accessorKey ? user[column.accessorKey as keyof User] : user,
                            user
                          )
                        : column.accessorKey
                        ? String(user[column.accessorKey as keyof User] || "")
                        : ""}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)} to{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToFirstPage}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToLastPage}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AdvancedUserTable
