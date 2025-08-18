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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
} from "lucide-react"
import { Product } from "@shared/schema"

interface ProductTableProps {
  data: Product[]
  categories?: Array<{ id: number; name: string }>
  loading?: boolean
  onProductEdit?: (product: Product) => void
  onProductDelete?: (product: Product) => void
  onProductView?: (product: Product) => void
}

export function RealProductTable({
  data = [],
  categories = [],
  loading = false,
  onProductEdit,
  onProductDelete,
  onProductView,
}: ProductTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [filters, setFilters] = useState({
    sku: "",
    name: "",
    category: "",
    barcode: "",
    status: "__all__",
  })

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(product => {
      const categoryName = categories.find(c => c.id === product.categoryId)?.name || ""
      return (
        (filters.sku === "" || product.sku.toLowerCase().includes(filters.sku.toLowerCase())) &&
        (filters.name === "" || product.name.toLowerCase().includes(filters.name.toLowerCase())) &&
        (filters.category === "" || categoryName.toLowerCase().includes(filters.category.toLowerCase())) &&
        (filters.barcode === "" || (product.barcode || "").toLowerCase().includes(filters.barcode.toLowerCase())) &&
        (filters.status === "" || filters.status === "__all__" || (product.isActive ? "active" : "inactive").includes(filters.status.toLowerCase()))
      )
    })
  }, [data, filters, categories])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentData = filteredData.slice(startIndex, endIndex)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products ({data.length})
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
          Products ({filteredData.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-2">
          <Input
            placeholder="Filter SKU..."
            value={filters.sku}
            onChange={(e) => setFilters(prev => ({ ...prev, sku: e.target.value }))}
            className="h-8"
          />
          <Input
            placeholder="Filter Name..."
            value={filters.name}
            onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
            className="h-8"
          />
          <Input
            placeholder="Filter Category..."
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="h-8"
          />
          <Input
            placeholder="Filter Barcode..."
            value={filters.barcode}
            onChange={(e) => setFilters(prev => ({ ...prev, barcode: e.target.value }))}
            className="h-8"
          />
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table showing REAL database columns */}
        <div className="border rounded-md overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="p-2 text-left font-medium">SKU</th>
                <th className="p-2 text-left font-medium">Name</th>
                <th className="p-2 text-left font-medium">Barcode</th>
                <th className="p-2 text-left font-medium">Description</th>
                <th className="p-2 text-left font-medium">Category</th>
                <th className="p-2 text-left font-medium">Price</th>
                <th className="p-2 text-left font-medium">Cost</th>
                <th className="p-2 text-left font-medium">Min Stock</th>
                <th className="p-2 text-left font-medium">Max Stock</th>
                <th className="p-2 text-left font-medium">Reorder Point</th>
                <th className="p-2 text-left font-medium">Weight</th>
                <th className="p-2 text-left font-medium">Length</th>
                <th className="p-2 text-left font-medium">Width</th>
                <th className="p-2 text-left font-medium">Height</th>
                <th className="p-2 text-left font-medium">UOM</th>
                <th className="p-2 text-left font-medium">Lead Time</th>
                <th className="p-2 text-left font-medium">Status</th>
                <th className="p-2 text-left font-medium">Image</th>
                <th className="p-2 text-left font-medium">Created</th>
                <th className="p-2 text-left font-medium">Actions</th>
              </tr>
            </thead>
            
            <tbody>
              {currentData.map((product) => {
                const categoryName = categories.find(c => c.id === product.categoryId)?.name || "—"
                
                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-2 font-mono text-sm">{product.sku}</td>
                    <td className="p-2 font-medium">{product.name}</td>
                    <td className="p-2 font-mono text-sm">{product.barcode || "—"}</td>
                    <td className="p-2 text-sm max-w-[200px] truncate">{product.description || "—"}</td>
                    <td className="p-2">
                      <Badge variant="secondary">{categoryName}</Badge>
                    </td>
                    <td className="p-2 font-medium">${product.price || "0.00"}</td>
                    <td className="p-2 text-gray-600">${product.cost || "0.00"}</td>
                    <td className="p-2">{product.minStockLevel || "0"}</td>
                    <td className="p-2">{product.maxStockLevel || "—"}</td>
                    <td className="p-2">{product.reorderPoint || "—"}</td>
                    <td className="p-2">{product.weight || "—"}</td>
                    <td className="p-2">{product.length || "—"}</td>
                    <td className="p-2">{product.width || "—"}</td>
                    <td className="p-2">{product.height || "—"}</td>
                    <td className="p-2">{product.uomId || "—"}</td>
                    <td className="p-2">{product.leadTime ? `${product.leadTime} days` : "—"}</td>
                    <td className="p-2">
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge variant={product.imageUrl ? "default" : "outline"}>
                        {product.imageUrl ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="p-2 text-sm text-gray-600">
                      {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-2">
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
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} products
          </div>
          
          <div className="flex items-center gap-2">
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
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
