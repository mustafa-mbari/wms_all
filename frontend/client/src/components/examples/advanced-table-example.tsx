import React from "react"
import { AdvancedTable, type ColumnDef } from "../ui/advanced-table"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Edit, Trash2, User } from "lucide-react"

// Sample data interface
interface User {
  id: number
  name: string
  email: string
  role: string
  status: "active" | "inactive" | "pending"
  department: string
  joinDate: string
  salary: number
}

// Sample data
const sampleUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
    status: "active",
    department: "IT",
    joinDate: "2023-01-15",
    salary: 75000,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com", 
    role: "User",
    status: "active",
    department: "Marketing",
    joinDate: "2023-02-20",
    salary: 65000,
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    role: "Manager",
    status: "inactive",
    department: "Sales",
    joinDate: "2022-11-10",
    salary: 85000,
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    role: "User",
    status: "pending",
    department: "IT",
    joinDate: "2023-03-05",
    salary: 70000,
  },
  {
    id: 5,
    name: "Tom Brown",
    email: "tom.brown@example.com",
    role: "Manager",
    status: "active",
    department: "Marketing",
    joinDate: "2022-08-12",
    salary: 80000,
  },
  {
    id: 6,
    name: "Lisa Davis",
    email: "lisa.davis@example.com",
    role: "User",
    status: "active",
    department: "Sales",
    joinDate: "2023-01-30",
    salary: 60000,
  }
]

export function AdvancedTableExample() {
  // Define columns
  const columns: ColumnDef<User>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      cell: (value, row) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
      cell: (value) => (
        <span className="text-muted-foreground">{value}</span>
      ),
    },
    {
      id: "role",
      header: "Role",
      accessorKey: "role",
      cell: (value) => (
        <Badge variant={value === "Admin" ? "default" : value === "Manager" ? "secondary" : "outline"}>
          {value}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status", 
      accessorKey: "status",
      cell: (value) => (
        <Badge 
          variant={
            value === "active" ? "default" : 
            value === "inactive" ? "destructive" : 
            "secondary"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      id: "department",
      header: "Department",
      accessorKey: "department",
    },
    {
      id: "joinDate",
      header: "Join Date",
      accessorKey: "joinDate",
      cell: (value) => new Date(value).toLocaleDateString(),
    },
    {
      id: "salary",
      header: "Salary",
      accessorKey: "salary",
      cell: (value) => (
        <span className="font-mono">
          ${value.toLocaleString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (_, row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              console.log("Edit user:", row.id)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              console.log("Delete user:", row.id)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      filterable: false,
    },
  ]

  const handleRowClick = (user: User) => {
    console.log("Row clicked:", user.name)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advanced Table Example</h1>
        <p className="text-muted-foreground">
          Demonstrating column search, filtering, grouping, and column visibility features.
        </p>
      </div>
      
      <AdvancedTable
        data={sampleUsers}
        columns={columns}
        onRowClick={handleRowClick}
        searchable={true}
        groupable={true}
        pagination={true}
        pageSize={5}
        className="shadow-lg"
      />

      <div className="space-y-4 text-sm text-muted-foreground">
        <h3 className="font-semibold text-foreground">Features Demonstrated:</h3>
        <ul className="space-y-1 list-disc list-inside">
          <li>🔎 <strong>Column Search:</strong> Search bars under each column header</li>
          <li>👥 <strong>Group By:</strong> Click the group icon in column headers or use the "Group By" dropdown</li>
          <li>⚙️ <strong>Column Settings:</strong> "Table Columns Settings" button to show/hide columns</li>
          <li>📄 <strong>Pagination:</strong> Navigate through pages with Previous/Next buttons</li>
          <li>🎨 <strong>Modern UI:</strong> Responsive design with shadows, hover effects, and clean styling</li>
          <li>🖱️ <strong>Interactive:</strong> Click on rows for actions, expandable groups</li>
        </ul>
      </div>
    </div>
  )
}

export default AdvancedTableExample
