# Reusable Generic Table Component

This document explains how to use the `AdvancedGenericTable` component, which is a reusable table component that provides the same functionality as your existing Users table but can be configured for any database entity.

## Features

The generic table component includes all the features from your Users table:

- ✅ **Column search/filter** - Filter by any column with different filter types
- ✅ **Column group by** - Group rows by any column
- ✅ **Inline CRUD** - Add/Edit/Delete functionality with customizable actions
- ✅ **Real-time updates** - Works with React Query for automatic data updates
- ✅ **Responsive design** - Fully responsive with Tailwind CSS
- ✅ **Column resizing** - Drag to resize columns
- ✅ **Sorting** - Click headers to sort by any column
- ✅ **Pagination** - Configurable page sizes
- ✅ **Bulk actions** - Select multiple rows and perform bulk operations
- ✅ **Export functionality** - Export data (when enabled)
- ✅ **Custom actions** - Add custom row-level actions

## Installation

The generic table component is located at:
```
frontend/client/src/components/ui/advanced-generic-table.tsx
```

## Basic Usage

### 1. Define Your Data Interface

```typescript
interface Product {
  id: number;
  sku: string;
  name: string;
  price?: number;
  isActive: boolean;
  createdAt: string;
  // ... other fields
}
```

### 2. Configure Table Columns

```typescript
import { ColumnConfig } from "@/components/ui/advanced-generic-table";

const productColumns: ColumnConfig<Product>[] = [
  {
    key: "sku",
    label: "SKU",
    width: 120,
    sortable: true,
    filterable: true,
    render: (product) => (
      <div className="font-mono text-sm">{product.sku}</div>
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
    key: "isActive",
    label: "Status",
    width: 100,
    sortable: true,
    filterable: true,
    groupable: true,
    filterType: "boolean",
    render: (product) => (
      <Badge variant={product.isActive ? "default" : "destructive"}>
        {product.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
];
```

### 3. Create Table Configuration

```typescript
import { TableConfig } from "@/components/ui/advanced-generic-table";

const tableConfig: TableConfig<Product> = {
  columns: productColumns,
  entityName: "Product",
  entityNamePlural: "Products",
  primaryKey: "id", // optional, defaults to "id"
};
```

### 4. Use the Component

```typescript
import { AdvancedGenericTable } from "@/components/ui/advanced-generic-table";

export default function ProductsPage() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const handleEdit = (product: Product) => {
    // Handle edit action
  };

  const handleDelete = (product: Product) => {
    // Handle delete action
  };

  const handleBulkAction = (action: string, productIds: string[]) => {
    // Handle bulk actions
  };

  return (
    <AdvancedGenericTable
      data={products}
      config={tableConfig}
      loading={isLoading}
      onItemEdit={handleEdit}
      onItemDelete={handleDelete}
      onBulkAction={handleBulkAction}
    />
  );
}
```

## Column Configuration Options

Each column can be configured with the following properties:

```typescript
interface ColumnConfig<T> {
  key: string;                    // Property key from your data
  label: string;                  // Display label
  sortable?: boolean;             // Enable sorting (default: true)
  filterable?: boolean;           // Enable filtering (default: true)
  groupable?: boolean;            // Enable grouping (default: true)
  width?: number;                 // Column width in pixels
  minWidth?: number;              // Minimum column width
  render?: (item: T) => React.ReactNode; // Custom render function
  filterType?: "text" | "select" | "date" | "boolean"; // Filter input type
  filterOptions?: Array<{         // Options for select filter
    value: string;
    label: string;
  }>;
}
```

## Filter Types

### Text Filter (default)
```typescript
{
  key: "name",
  label: "Name",
  filterable: true,
  // filterType: "text" is default
}
```

### Boolean Filter
```typescript
{
  key: "isActive",
  label: "Status",
  filterable: true,
  filterType: "boolean",
}
```

### Select Filter
```typescript
{
  key: "category",
  label: "Category",
  filterable: true,
  filterType: "select",
  filterOptions: [
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "books", label: "Books" },
  ],
}
```

## Custom Actions

### Row-level Custom Actions
```typescript
const customActions = [
  {
    key: "duplicate",
    label: "Duplicate",
    icon: <Copy className="h-4 w-4" />,
    onClick: (item) => {
      // Handle duplicate action
    },
  },
];

<AdvancedGenericTable
  // ... other props
  customActions={customActions}
/>
```

### Bulk Actions
```typescript
const bulkActions = [
  {
    key: "activate",
    label: "Activate",
    variant: "default" as const,
  },
  {
    key: "delete",
    label: "Delete",
    variant: "destructive" as const,
  },
];

<AdvancedGenericTable
  // ... other props
  bulkActions={bulkActions}
  onBulkAction={handleBulkAction}
/>
```

## Complete Component Props

```typescript
interface AdvancedGenericTableProps<T> {
  data: T[];                      // Your data array
  config: TableConfig<T>;         // Table configuration
  loading?: boolean;              // Loading state
  onItemSelect?: (itemIds: string[]) => void; // Selection callback
  onBulkAction?: (action: string, itemIds: string[]) => void; // Bulk action handler
  onItemEdit?: (item: T) => void; // Edit handler
  onItemDelete?: (item: T) => void; // Delete handler
  onItemView?: (item: T) => void; // View handler
  enableSelection?: boolean;      // Enable row selection (default: true)
  enableBulkActions?: boolean;    // Enable bulk actions (default: true)
  enableExport?: boolean;         // Enable export (default: true)
  customActions?: Array<{         // Custom row actions
    key: string;
    label: string;
    icon?: React.ReactNode;
    onClick: (item: T) => void;
    variant?: ButtonVariant;
  }>;
  bulkActions?: Array<{           // Bulk actions
    key: string;
    label: string;
    icon?: React.ReactNode;
    variant?: ButtonVariant;
  }>;
}
```

## Example Pages Created

I've created example pages for all the requested entities:

1. **Products** - `frontend/client/src/pages/products-generic/index.tsx`
2. **Categories** - `frontend/client/src/pages/categories/index.tsx`
3. **Product Families** - `frontend/client/src/pages/product-families/index.tsx`
4. **Attributes** - `frontend/client/src/pages/product-attributes/index.tsx`
5. **Attribute Options** - `frontend/client/src/pages/attribute-options/index.tsx`
6. **Attribute Values** - `frontend/client/src/pages/attribute-values/index.tsx`
7. **Units of Measure** - `frontend/client/src/pages/units-of-measure/index.tsx`

Each page demonstrates:
- Proper column configuration for the entity
- Custom rendering for different data types
- Appropriate filter types
- Entity-specific bulk actions
- Custom row actions
- CRUD operations integration

## Migration from Existing Tables

To migrate an existing table to use the generic component:

1. **Extract your data interface** from existing types
2. **Convert table columns** to the `ColumnConfig` format
3. **Move rendering logic** into column `render` functions
4. **Configure filters** using `filterType` and `filterOptions`
5. **Set up event handlers** for CRUD operations
6. **Replace your table component** with `AdvancedGenericTable`

## Benefits

- **Consistency** - All tables have the same UX and functionality
- **Maintainability** - Bug fixes and features benefit all tables
- **Reusability** - Easy to create new tables for any entity
- **Type Safety** - Full TypeScript support with generics
- **Flexibility** - Highly configurable without losing functionality

## Notes

- The component maintains the same state management patterns as your Users table
- All existing Users table features are preserved
- The component is fully responsive and follows your Tailwind design system
- It integrates seamlessly with React Query for data management
- Column settings and export functionality can be enabled/disabled as needed
