import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  Row,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Settings2,
  Download,
  Mail,
  Trash2,
  Filter,
  FilterX,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Eye,
  Shield,
  Key,
  Building,
  Phone,
  CheckCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { User } from "@shared/schema";

// Extended User type with role information from the API
export interface UserWithRoles extends User {
  role_names?: string[];
  role_slugs?: string[];
}

interface WmTableProps {
  data: UserWithRoles[]
  onRowClick?: (user: UserWithRoles) => void
  onEdit?: (user: UserWithRoles) => void
  onDelete?: (user: UserWithRoles) => void
  onManageRoles?: (user: UserWithRoles) => void
  onChangePassword?: (user: UserWithRoles) => void
  canPerformAdminActions?: boolean
  getWarehouseName?: (warehouseId?: string) => string
  className?: string
}

// Get user initials for avatar
const getUserInitials = (user: UserWithRoles): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
  }
  return user.username.substring(0, 2).toUpperCase()
}

// Storage keys for persistence
const STORAGE_KEY = 'wm-table-settings'

interface TableSettings {
  columnVisibility: VisibilityState
  columnWidths: Record<string, number>
  pageSize: number
  sorting: SortingState
}

const defaultSettings: TableSettings = {
  columnVisibility: {},
  columnWidths: {},
  pageSize: 10,
  sorting: [],
}

export function WmTable({
  data,
  onRowClick,
  onEdit,
  onDelete,
  onManageRoles,
  onChangePassword,
  canPerformAdminActions = false,
  getWarehouseName = (warehouseId?: string) => warehouseId || '—',
  className,
}: WmTableProps) {
  // State management
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pageSize, setPageSize] = useState(10)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY)
      if (savedSettings) {
        const settings: TableSettings = JSON.parse(savedSettings)
        setColumnVisibility(settings.columnVisibility || {})
        setColumnWidths(settings.columnWidths || {})
        setPageSize(settings.pageSize || 10)
        setSorting(settings.sorting || [])
      }
    } catch (error) {
      console.error('Failed to load table settings:', error)
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = useCallback(() => {
    try {
      const settings: TableSettings = {
        columnVisibility,
        columnWidths,
        pageSize,
        sorting,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save table settings:', error)
    }
  }, [columnVisibility, columnWidths, pageSize, sorting])

  // Auto-save settings when they change
  useEffect(() => {
    saveSettings()
  }, [saveSettings])

  // Column definitions
  const columns: ColumnDef<UserWithRoles>[] = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
      },
      {
        accessorKey: 'username',
        header: ({ column }) => (
          <div className="flex flex-col space-y-2">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-auto p-0 font-semibold justify-start"
            >
              Username
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
            <Input
              placeholder="Filter username..."
              value={(column.getFilterValue() as string) ?? ''}
              onChange={(event) => column.setFilterValue(event.target.value)}
              className="h-8 text-xs"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getUserInitials(row.original)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{row.getValue('username')}</div>
              <div className="text-xs text-muted-foreground">
                ID: {row.original.id}
              </div>
            </div>
          </div>
        ),
        size: 200,
      },
      {
        id: 'fullName',
        accessorFn: (row) => `${row.firstName || ''} ${row.lastName || ''}`.trim(),
        header: ({ column }) => (
          <div className="flex flex-col space-y-2">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-auto p-0 font-semibold justify-start"
            >
              Full Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
            <Input
              placeholder="Filter name..."
              value={(column.getFilterValue() as string) ?? ''}
              onChange={(event) => column.setFilterValue(event.target.value)}
              className="h-8 text-xs"
            />
          </div>
        ),
        cell: ({ row }) => {
          const fullName = `${row.original.firstName || ''} ${row.original.lastName || ''}`.trim()
          return fullName || '—'
        },
        size: 180,
      },
      {
        accessorKey: 'email',
        header: ({ column }) => (
          <div className="flex flex-col space-y-2">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-auto p-0 font-semibold justify-start"
            >
              Email
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
            <Input
              placeholder="Filter email..."
              value={(column.getFilterValue() as string) ?? ''}
              onChange={(event) => column.setFilterValue(event.target.value)}
              className="h-8 text-xs"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div>
            <div className="flex items-center">
              <Mail className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{row.getValue('email')}</span>
            </div>
            {row.original.phone && (
              <div className="flex items-center mt-1">
                <Phone className="mr-1 h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{row.original.phone}</span>
              </div>
            )}
          </div>
        ),
        size: 250,
      },
      {
        id: 'roles',
        accessorFn: (row) => row.role_names?.join(', ') || (row.isAdmin ? 'Administrator' : 'User'),
        header: ({ column }) => (
          <div className="flex flex-col space-y-2">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-auto p-0 font-semibold justify-start"
            >
              Roles
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
            <Select
              value={(column.getFilterValue() as string) ?? ''}
              onValueChange={(value) => column.setFilterValue(value === 'all' ? '' : value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="Administrator">Administrator</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ),
        cell: ({ row }) => (
          <div>
            <div className="flex flex-wrap gap-1">
              {row.original.role_names && row.original.role_names.length > 0 ? (
                row.original.role_names.map((roleName, index) => (
                  <Badge
                    key={index}
                    variant={roleName.toLowerCase().includes('admin') ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {roleName}
                  </Badge>
                ))
              ) : row.original.isAdmin ? (
                <Badge variant="default" className="text-xs">Administrator</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">User</Badge>
              )}
            </div>
            {row.original.defaultWarehouseId && (
              <div className="flex items-center mt-1">
                <Building className="mr-1 h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {getWarehouseName(row.original.defaultWarehouseId)}
                </span>
              </div>
            )}
          </div>
        ),
        size: 150,
      },
      {
        accessorKey: 'isActive',
        header: ({ column }) => (
          <div className="flex flex-col space-y-2">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-auto p-0 font-semibold justify-start"
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
            <Select
              value={(column.getFilterValue() as string) ?? ''}
              onValueChange={(value) => column.setFilterValue(value === 'all' ? '' : value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ),
        cell: ({ row }) => (
          <div>
            {row.getValue('isActive') ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                <CheckCircle className="mr-1 h-3 w-3" />
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="border-red-200 text-red-800 dark:border-red-800 dark:text-red-300">
                <XCircle className="mr-1 h-3 w-3" />
                Inactive
              </Badge>
            )}
            {row.original.lastLogin && (
              <div className="text-xs text-muted-foreground mt-1">
                Last: {new Date(row.original.lastLogin).toLocaleDateString()}
              </div>
            )}
          </div>
        ),
        size: 120,
      },
      {
        id: 'actions',
        enableHiding: false,
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center space-x-1">
            {canPerformAdminActions && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.(row.original)
                  }}
                  title="Edit user"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.(row.original)
                  }}
                  title="Delete user"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {canPerformAdminActions ? (
                  <>
                    <DropdownMenuItem onClick={() => onEdit?.(row.original)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onManageRoles?.(row.original)}>
                      <Shield className="mr-2 h-4 w-4" />
                      Manage Roles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onChangePassword?.(row.original)}>
                      <Key className="mr-2 h-4 w-4" />
                      Change Password
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(row.original)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => onRowClick?.(row.original)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        size: 120,
      },
    ],
    [canPerformAdminActions, getWarehouseName, onEdit, onDelete, onManageRoles, onChangePassword, onRowClick]
  )

  // Table instance
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  // Reset all settings
  const resetSettings = () => {
    setColumnVisibility({})
    setColumnWidths({})
    setPageSize(10)
    setSorting([])
    setColumnFilters([])
    setRowSelection({})
    localStorage.removeItem(STORAGE_KEY)
  }

  // Clear all filters
  const clearAllFilters = () => {
    setColumnFilters([])
    table.resetColumnFilters()
  }

  // Export functions
  const exportToCSV = (selectedOnly = false) => {
    const rows = selectedOnly 
      ? table.getFilteredSelectedRowModel().rows 
      : table.getFilteredRowModel().rows
    
    const headers = table.getVisibleFlatColumns()
      .filter(col => col.id !== 'select' && col.id !== 'actions')
      .map(col => {
        if (typeof col.columnDef.header === 'string') {
          return col.columnDef.header
        }
        return col.id
      })
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        table.getVisibleFlatColumns()
          .filter(col => col.id !== 'select' && col.id !== 'actions')
          .map(col => {
            const value = row.getValue(col.id) || ''
            return `"${String(value).replace(/"/g, '""')}"`
          })
          .join(',')
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length
  const hasFilters = columnFilters.length > 0

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="mr-2 h-4 w-4" />
                Column Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Table Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="mb-3 text-sm font-medium">Column Visibility</h4>
                  <div className="space-y-2">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => (
                        <div key={column.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={column.id}
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                            }
                          />
                          <label
                            htmlFor={column.id}
                            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {typeof column.columnDef.header === 'string' 
                              ? column.columnDef.header 
                              : column.id}
                          </label>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={resetSettings}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset All
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              <FilterX className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportToCSV(false)}>
                Export All to CSV
              </DropdownMenuItem>
              {selectedRowsCount > 0 && (
                <DropdownMenuItem onClick={() => exportToCSV(true)}>
                  Export Selected ({selectedRowsCount}) to CSV
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Rows per page:
          </span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number(value))
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selection toolbar */}
      {selectedRowsCount > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium">
              {selectedRowsCount} row(s) selected
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Email Selected
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportToCSV(true)}>
              <Download className="mr-2 h-4 w-4" />
              Export Selected
            </Button>
            {canPerformAdminActions && (
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="p-2"
                    style={{
                      width: header.getSize(),
                      minWidth: header.column.columnDef.size,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronFirst className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronLast className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WmTable
