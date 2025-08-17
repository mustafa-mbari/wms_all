# Enhanced shadcn/ui Table Component

This enhanced table component provides advanced features for data display and manipulation, built on top of shadcn/ui components.

## Features

### 🔎 Column Search & Filtering
- **Search bars under each column header** for real-time filtering
- **Clear filter buttons** (X icon) to remove individual column filters
- **Case-insensitive search** across all text content
- **Configurable filtering** per column using `filterable: false` option

### 👥 Group By Functionality
- **Click group icons** in column headers to group by that column
- **Group By dropdown** for easy column selection
- **Expandable/collapsible groups** with expand/collapse controls
- **Group counts** showing number of items in each group
- **Visual group headers** with distinct styling

### ⚙️ Column Visibility Settings
- **"Table Columns Settings" button** to open column configuration dialog
- **Checkbox controls** to show/hide individual columns
- **Visual indicators** (eye icons) showing column visibility status
- **Persistent column state** during session

### 🎨 Modern UI/UX
- **Clean, responsive design** with proper spacing and shadows
- **Hover effects** and smooth transitions
- **Professional dashboard styling** with rounded corners and shadows
- **Accessible controls** with proper ARIA labels and keyboard support
- **Mobile-responsive** layout that adapts to screen size

### 📄 Optional Pagination
- **Previous/Next navigation** with disabled states
- **Page count display** showing current page and total pages
- **Configurable page size** via props

## Usage

### Basic Setup

```tsx
import { AdvancedTable, type ColumnDef } from "@/components/ui/advanced-table"

// Define your data interface
interface User {
  id: number
  name: string
  email: string
  role: string
  status: "active" | "inactive"
}

// Define columns
const columns: ColumnDef<User>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
  },
  {
    id: "email", 
    header: "Email",
    accessorKey: "email",
  },
  {
    id: "role",
    header: "Role", 
    accessorKey: "role",
    cell: (value) => <Badge>{value}</Badge>
  }
]

// Use the component
<AdvancedTable
  data={users}
  columns={columns}
  searchable={true}
  groupable={true}
  pagination={true}
  pageSize={10}
/>
```

### Column Definition Options

```tsx
interface ColumnDef<T> {
  id: string                              // Unique column identifier
  header: string                          // Display name in header
  accessorKey?: string                    // Path to data property (supports nested: "user.profile.name")
  cell?: (value: any, row: T) => ReactNode // Custom cell renderer
  sortable?: boolean                      // Enable sorting (future feature)
  filterable?: boolean                    // Enable filtering (default: true)
  width?: string | number                 // Column width
}
```

### Advanced Cell Rendering

```tsx
const columns: ColumnDef<User>[] = [
  {
    id: "status",
    header: "Status",
    accessorKey: "status", 
    cell: (value, row) => (
      <Badge variant={value === "active" ? "default" : "secondary"}>
        {value}
      </Badge>
    )
  },
  {
    id: "actions",
    header: "Actions",
    cell: (_, row) => (
      <div className="flex gap-1">
        <Button size="sm" onClick={() => editUser(row.id)}>
          Edit
        </Button>
        <Button size="sm" variant="destructive" onClick={() => deleteUser(row.id)}>
          Delete
        </Button>
      </div>
    ),
    filterable: false  // Disable filtering for action columns
  }
]
```

### Props Reference

```tsx
interface AdvancedTableProps<T> {
  data: T[]                              // Array of data objects
  columns: ColumnDef<T>[]                // Column definitions
  className?: string                     // Additional CSS classes
  onRowClick?: (row: T) => void          // Row click handler
  searchable?: boolean                   // Enable column search (default: true)
  groupable?: boolean                    // Enable grouping (default: true)  
  pagination?: boolean                   // Enable pagination (default: false)
  pageSize?: number                      // Items per page (default: 10)
}
```

## Styling and Customization

The component uses Tailwind CSS classes and follows shadcn/ui design patterns:

- **Shadows**: `shadow-sm` on table container, `shadow-lg` for enhanced effect
- **Borders**: Consistent border styling with `border` and `border-b`
- **Spacing**: Proper padding with `px-4 py-3` for cells
- **Colors**: Uses semantic color tokens like `text-muted-foreground`
- **Hover states**: `hover:bg-muted/50` for interactive elements

### Custom Styling

```tsx
<AdvancedTable
  data={data}
  columns={columns}
  className="border-2 border-primary shadow-xl rounded-xl"
/>
```

## Integration Examples

### With React Hook Form

```tsx
const { watch } = useForm()
const filteredData = useMemo(() => {
  const searchTerm = watch("search")
  return data.filter(item => 
    item.name.toLowerCase().includes(searchTerm?.toLowerCase() || "")
  )
}, [data, watch("search")])

<AdvancedTable data={filteredData} columns={columns} />
```

### With API Data

```tsx
const { data, isLoading } = useQuery('users', fetchUsers)

if (isLoading) return <div>Loading...</div>

return (
  <AdvancedTable
    data={data || []}
    columns={columns}
    onRowClick={(user) => router.push(`/users/${user.id}`)}
  />
)
```

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest) 
- ✅ Safari (latest)
- ✅ Edge (latest)

## Dependencies

- React 18+
- Tailwind CSS
- shadcn/ui components:
  - Button
  - Input  
  - Checkbox
  - Dialog
  - DropdownMenu
  - Table
- Lucide React icons
- Radix UI primitives

## Performance Notes

- Uses `useMemo` for expensive filtering and grouping operations
- Pagination reduces DOM nodes for large datasets
- Virtual scrolling recommended for 1000+ rows (future enhancement)

## Accessibility

- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ ARIA labels on interactive elements
- ✅ Focus management
- ✅ Color contrast compliance
