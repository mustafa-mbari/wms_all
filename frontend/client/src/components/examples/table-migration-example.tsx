// Example: Migrating from basic Table to AdvancedTable
// This shows how to upgrade an existing table in your project

// BEFORE: Basic shadcn/ui table
/*
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function BasicUsersTable({ users }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
*/

// AFTER: Enhanced AdvancedTable with all features
import React from "react"
import { AdvancedTable, type ColumnDef } from "@/components/ui/advanced-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
  department: string
}

export function EnhancedUsersTable({ 
  users, 
  onEditUser, 
  onDeleteUser 
}: {
  users: User[]
  onEditUser?: (user: User) => void
  onDeleteUser?: (user: User) => void
}) {
  const columns: ColumnDef<User>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      cell: (value) => <span className="font-medium">{value}</span>
    },
    {
      id: "email", 
      header: "Email",
      accessorKey: "email",
      cell: (value) => <span className="text-muted-foreground">{value}</span>
    },
    {
      id: "role",
      header: "Role",
      accessorKey: "role",
      cell: (value) => <Badge variant="outline">{value}</Badge>
    },
    {
      id: "status",
      header: "Status", 
      accessorKey: "status",
      cell: (value) => (
        <Badge variant={value === "active" ? "default" : "secondary"}>
          {value}
        </Badge>
      )
    },
    {
      id: "department",
      header: "Department",
      accessorKey: "department"
    },
    {
      id: "actions",
      header: "Actions",
      cell: (_, row) => (
        <div className="flex gap-1">
          {onEditUser && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onEditUser(row)
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDeleteUser && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteUser(row)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
      filterable: false
    }
  ]

  return (
    <AdvancedTable
      data={users}
      columns={columns}
      searchable={true}
      groupable={true}
      pagination={true}
      pageSize={10}
      onRowClick={(user) => console.log("Clicked user:", user.name)}
      className="shadow-lg"
    />
  )
}

// Usage in your existing pages:
/*
// Replace this:
<BasicUsersTable users={users} />

// With this:
<EnhancedUsersTable 
  users={users}
  onEditUser={handleEditUser}
  onDeleteUser={handleDeleteUser}
/>
*/
