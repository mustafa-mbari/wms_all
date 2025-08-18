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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  DollarSign,
  Barcode,
} from "lucide-react"

interface Product {
  id: number
  sku: string
  name: string
  barcode?: string | null
  description?: string | null
  categoryId?: number | null
  uomId?: string | null
  price?: string | null
  cost?: string | null
  weight?: string | null
  length?: string | null
  width?: string | null
  height?: string | null
  minStockLevel?: number | null
  maxStockLevel?: number | null
  reorderPoint?: number | null
  leadTime?: number | null
  isActive: boolean
  imageUrl?: string | null
  createdAt: string
  updatedAt: string
}

interface Category {
  id: number
  name: string
}

interface ProductTableProps {
  data: Product[]
  categories: Category[]
  loading?: boolean
  onProductEdit?: (product: Product) => void
  onProductDelete?: (product: Product) => void
  onProductView?: (product: Product) => void
}

interface ColumnFilters {
  sku: string
  name: string
  barcode: string
  category: string
  price: string
  status: string
}

type SortDirection = "asc" | "desc" | null
type SortableColumn = "sku" | "name" | "barcode" | "category" | "price" | "status" | "created"

interface SortConfig {
  column: SortableColumn | null
  direction: SortDirection
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

export function ProductTable({
  data,
  categories = [],
  loading = false,
  onProductEdit,
  onProductDelete,
  onProductView
}: ProductTableProps) {
  
  // State for filters
  const [filters, setFilters] = useState<ColumnFilters>({
    sku: "",
    name: "",
    barcode: "",
    category: "__all__",
    price: "",
    status: "__all__"
  })

  // State for sorting
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    direction: null
  })

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // State for selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(product => {
      const categoryName = categories.find(c => c.id === product.categoryId)?.name || ""
      
      return (
        (filters.sku === "" || product.sku.toLowerCase().includes(filters.sku.toLowerCase())) &&
        (filters.name === "" || product.name.toLowerCase().includes(filters.name.toLowerCase())) &&
        (filters.barcode === "" || (product.barcode || "").toLowerCase().includes(filters.barcode.toLowerCase())) &&
        (filters.category === "__all__" || categoryName.toLowerCase().includes(filters.category.toLowerCase())) &&
        (filters.price === "" || (product.price || "").includes(filters.price)) &&
        (filters.status === "__all__" || (product.isActive ? "active" : "inactive").includes(filters.status.toLowerCase()))
      )
    })

    // Apply sorting
    if (sortConfig.column && sortConfig.direction) {
      filtered.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (sortConfig.column) {
          case "sku":
            aValue = a.sku
            bValue = b.sku
            break
          case "name":
            aValue = a.name
            bValue = b.name
            break
          case "barcode":
            aValue = a.barcode || ""
            bValue = b.barcode || ""
            break
          case "category":
            aValue = categories.find(c => c.id === a.categoryId)?.name || ""
            bValue = categories.find(c => c.id === b.categoryId)?.name || ""
            break
          case "price":
            aValue = parseFloat(a.price || "0")
            bValue = parseFloat(b.price || "0")
            break
          case "status":
            aValue = a.isActive ? "active" : "inactive"
            bValue = b.isActive ? "active" : "inactive"
            break
          case "created":
            aValue = new Date(a.createdAt)
            bValue = new Date(b.createdAt)
            break
          default:
            aValue = ""
            bValue = ""
        }

        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [data, filters, sortConfig, categories])

  // Pagination
  const totalItems = filteredAndSortedData.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentData = filteredAndSortedData.slice(startIndex, endIndex)

  // Handle sorting
  const handleSort = (column: SortableColumn) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc"
    }))
  }

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(currentData.map(product => product.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectProduct = (productId: number, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(productId)
    } else {
      newSelected.delete(productId)
    }
    setSelectedIds(newSelected)
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      sku: "",
      name: "",
      barcode: "",
      category: "__all__",
      price: "",
      status: "__all__"
    })
    setCurrentPage(1)
  }

  const renderSortIcon = (column: SortableColumn) => {
    if (sortConfig.column !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />
    }
    return sortConfig.direction === "asc" 
      ? <ArrowUp className="ml-2 h-4 w-4 text-blue-500" />
      : <ArrowDown className="ml-2 h-4 w-4 text-blue-500" />
  }

  const getUniqueFilterValues = (column: keyof ColumnFilters) => {
    const values = new Set<string>()
    
    data.forEach(product => {
      let value = ""
      switch (column) {
        case "category":
          value = categories.find(c => c.id === product.categoryId)?.name || ""
          break
        case "status":
          value = product.isActive ? "active" : "inactive"
          break
      }
      if (value) values.add(value)
    })
    
    return Array.from(values).sort()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Catalog
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Product Catalog ({totalItems})
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <Input
            placeholder="Filter SKU..."
            value={filters.sku}
            onChange={(e) => setFilters(prev => ({ ...prev, sku: e.target.value }))}
            className="h-8"
          />
          
          <Input
            placeholder="Filter name..."
            value={filters.name}
            onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
            className="h-8"
          />
          
          <Input
            placeholder="Filter barcode..."
            value={filters.barcode}
            onChange={(e) => setFilters(prev => ({ ...prev, barcode: e.target.value }))}
            className="h-8"
          />
          
          <Select
            value={filters.category}
            onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Categories</SelectItem>
              {getUniqueFilterValues("category").map(value => (
                <SelectItem key={value} value={value}>{value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input
            placeholder="Filter price..."
            value={filters.price}
            onChange={(e) => setFilters(prev => ({ ...prev, price: e.target.value }))}
            className="h-8"
          />
          
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="h-8"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.size === currentData.length && currentData.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("sku")}
                >
                  <div className="flex items-center">
                    SKU
                    {renderSortIcon("sku")}
                  </div>
                </TableHead>
                
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Name
                    {renderSortIcon("name")}
                  </div>
                </TableHead>
                
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("barcode")}
                >
                  <div className="flex items-center">
                    Barcode
                    {renderSortIcon("barcode")}
                  </div>
                </TableHead>
                
                <TableHead>Description</TableHead>
                
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center">
                    Category
                    {renderSortIcon("category")}
                  </div>
                </TableHead>
                
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("price")}
                >
                  <div className="flex items-center">
                    Price
                    {renderSortIcon("price")}
                  </div>
                </TableHead>
                
                <TableHead>Cost</TableHead>
                <TableHead>Stock Levels</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>UOM</TableHead>
                <TableHead>Lead Time</TableHead>
                
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    {renderSortIcon("status")}
                  </div>
                </TableHead>
                
                <TableHead>Image</TableHead>
                
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("created")}
                >
                  <div className="flex items-center">
                    Created
                    {renderSortIcon("created")}
                  </div>
                </TableHead>
                
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {currentData.map((product) => {
                const categoryName = categories.find(c => c.id === product.categoryId)?.name
                const dimensions = [product.length, product.width, product.height].filter(Boolean).join(" × ") || "—"
                
                return (
                  <TableRow key={product.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(product.id)}
                        onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                      />
                    </TableCell>
                    
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    
                    <TableCell className="font-medium">{product.name}</TableCell>
                    
                    <TableCell className="font-mono text-sm">
                      {product.barcode || "—"}
                    </TableCell>
                    
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={product.description || ""}>
                        {product.description || "—"}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {categoryName ? (
                        <Badge variant="secondary">{categoryName}</Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    
                    <TableCell className="font-medium">
                      {product.price ? `$${parseFloat(product.price).toFixed(2)}` : "—"}
                    </TableCell>
                    
                    <TableCell className="text-gray-600">
                      {product.cost ? `$${parseFloat(product.cost).toFixed(2)}` : "—"}
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        <div>Min: {product.minStockLevel || "—"}</div>
                        <div>Max: {product.maxStockLevel || "—"}</div>
                        <div>Reorder: {product.reorderPoint || "—"}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-sm">
                      {dimensions}
                    </TableCell>
                    
                    <TableCell className="text-sm">
                      {product.weight || "—"}
                    </TableCell>
                    
                    <TableCell className="text-sm">
                      {product.uomId || "—"}
                    </TableCell>
                    
                    <TableCell className="text-sm">
                      {product.leadTime ? `${product.leadTime} days` : "—"}
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      {product.imageUrl ? (
                        <Badge variant="outline" className="text-green-600">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-400">
                          No
                        </Badge>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-sm text-gray-600">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {onProductView && (
                            <DropdownMenuItem onClick={() => onProductView(product)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                          )}
                          {onProductEdit && (
                            <DropdownMenuItem onClick={() => onProductEdit(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {onProductDelete && (
                            <DropdownMenuItem 
                              onClick={() => onProductDelete(product)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} products
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">Products per page:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map(size => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm px-2">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
