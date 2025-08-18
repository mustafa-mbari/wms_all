import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimpleGenericTable, TableConfig, ColumnConfig } from "@/components/ui/simple-generic-table";
import { Package, Plus } from "lucide-react";

// Mock product data for testing
const mockProducts = [
  {
    id: 1,
    sku: "PROD-001",
    name: "Laptop Computer",
    price: 999.99,
    isActive: true,
    createdAt: "2024-01-15T10:30:00Z",
    category: "Electronics"
  },
  {
    id: 2,
    sku: "PROD-002", 
    name: "Office Chair",
    price: 299.99,
    isActive: true,
    createdAt: "2024-01-16T14:20:00Z",
    category: "Furniture"
  },
  {
    id: 3,
    sku: "PROD-003",
    name: "Coffee Mug",
    price: 12.99,
    isActive: false,
    createdAt: "2024-01-17T09:15:00Z",
    category: "Kitchen"
  }
];

interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  category: string;
}

export default function SimpleProductsPage() {
  const [products] = useState<Product[]>(mockProducts);

  // Define table columns configuration
  const productColumns: ColumnConfig<Product>[] = [
    {
      key: "sku",
      label: "SKU",
      width: 120,
      sortable: true,
      filterable: true,
      render: (product) => (
        <div className="font-mono text-sm">
          {product.sku}
        </div>
      ),
    },
    {
      key: "name",
      label: "Product Name",
      width: 250,
      sortable: true,
      filterable: true,
      render: (product) => (
        <div className="font-medium">{product.name}</div>
      ),
    },
    {
      key: "category",
      label: "Category",
      width: 150,
      sortable: true,
      filterable: true,
      render: (product) => (
        <Badge variant="outline">{product.category}</Badge>
      ),
    },
    {
      key: "price",
      label: "Price",
      width: 100,
      sortable: true,
      filterable: true,
      render: (product) => (
        <span className="font-medium">${product.price.toFixed(2)}</span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      width: 100,
      sortable: true,
      filterable: true,
      filterType: "boolean",
      render: (product) => (
        <Badge variant={product.isActive ? "default" : "destructive"}>
          {product.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      width: 120,
      sortable: true,
      filterable: true,
      render: (product) => (
        <span className="text-sm text-muted-foreground">
          {new Date(product.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Table configuration
  const tableConfig: TableConfig<Product> = {
    columns: productColumns,
    entityName: "Product",
    entityNamePlural: "Products",
    primaryKey: "id",
  };

  // Table event handlers
  const handleProductEdit = (product: Product) => {
    alert(`Edit product: ${product.name}`);
  };

  const handleProductDelete = (product: Product) => {
    alert(`Delete product: ${product.name}`);
  };

  const handleProductView = (product: Product) => {
    alert(`View product: ${product.name}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Simple Products Test</h1>
            <p className="text-muted-foreground">
              Testing the simplified generic table component
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Simple Generic Table */}
        <SimpleGenericTable
          data={products}
          config={tableConfig}
          loading={false}
          onItemEdit={handleProductEdit}
          onItemDelete={handleProductDelete}
          onItemView={handleProductView}
        />
      </div>
    </DashboardLayout>
  );
}
