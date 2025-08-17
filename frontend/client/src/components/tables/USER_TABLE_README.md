# UserTable Component

A reusable table component for displaying user data with built-in functionality for actions, search, sorting, grouping, and pagination.

## Features

- **User Display**: Shows user avatar, username, name, email, phone, role, and status
- **Actions**: Edit, delete, manage roles, change password (based on permissions)
- **Search & Filter**: Built-in search functionality for all user fields
- **Sorting**: Column header sorting (ascending/descending)
- **Grouping**: Group users by any column
- **Pagination**: Configurable page size and navigation
- **Permissions**: Conditional action visibility based on user permissions

## Usage

### Basic Usage

```tsx
import { UserTable, type UserWithRoles } from "@/components/tables/user-table";

const users: UserWithRoles[] = [
  {
    id: "1",
    username: "john_doe",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    isActive: true,
    isAdmin: false,
    role_names: ["User"],
    role_slugs: ["user"],
    // ... other user properties
  },
];

function MyUsersPage() {
  return (
    <UserTable
      data={users}
      onRowClick={(user) => console.log("Clicked:", user.username)}
    />
  );
}
```

### Advanced Usage with All Features

```tsx
import { UserTable, type UserWithRoles } from "@/components/tables/user-table";
import { useAuth } from "@/hooks/use-auth";

function AdvancedUsersPage() {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);

  const handleEdit = (user: UserWithRoles) => {
    // Open edit dialog
    console.log("Edit user:", user.username);
  };

  const handleDelete = (user: UserWithRoles) => {
    // Open delete confirmation
    console.log("Delete user:", user.username);
  };

  const handleManageRoles = (user: UserWithRoles) => {
    // Open role management dialog
    console.log("Manage roles for:", user.username);
  };

  const handleChangePassword = (user: UserWithRoles) => {
    // Open password change dialog
    console.log("Change password for:", user.username);
  };

  const getWarehouseName = (warehouseId?: string) => {
    // Your warehouse lookup logic
    return warehouseId ? `Warehouse ${warehouseId}` : "—";
  };

  return (
    <UserTable
      data={users}
      onRowClick={(user) => console.log("Row clicked:", user.username)}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onManageRoles={handleManageRoles}
      onChangePassword={handleChangePassword}
      canPerformAdminActions={isSuperAdmin()}
      getWarehouseName={getWarehouseName}
      searchable={true}
      groupable={true}
      sortable={true}
      pagination={true}
      pageSize={25}
      className="custom-table-style"
    />
  );
}
```

### Integration with existing users page

```tsx
// The UserTable is already integrated in pages/users/index.tsx
// You can copy the implementation pattern from there
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `UserWithRoles[]` | required | Array of users to display |
| `onRowClick` | `(user: UserWithRoles) => void` | optional | Callback when a user row is clicked |
| `onEdit` | `(user: UserWithRoles) => void` | optional | Callback when edit button is clicked |
| `onDelete` | `(user: UserWithRoles) => void` | optional | Callback when delete button is clicked |
| `onManageRoles` | `(user: UserWithRoles) => void` | optional | Callback when manage roles is clicked |
| `onChangePassword` | `(user: UserWithRoles) => void` | optional | Callback when change password is clicked |
| `canPerformAdminActions` | `boolean` | `false` | Whether to show admin action buttons |
| `getWarehouseName` | `(warehouseId?: string) => string` | returns warehouseId | Function to get warehouse name by ID |
| `className` | `string` | optional | Custom CSS classes for the table |
| `searchable` | `boolean` | `true` | Whether to show search functionality |
| `groupable` | `boolean` | `true` | Whether to show grouping functionality |
| `sortable` | `boolean` | `true` | Whether to show sorting functionality |
| `pagination` | `boolean` | `true` | Whether to show pagination |
| `pageSize` | `number` | `10` | Number of items per page |

## Types

### UserWithRoles

Extends the base `User` type with additional role information:

```tsx
interface UserWithRoles extends User {
  role_names?: string[];
  role_slugs?: string[];
}
```

## Dependencies

- `@/components/ui/advanced-table` - The underlying advanced table component
- `@/components/ui/badge` - For role and status badges
- `@/components/ui/button` - For action buttons
- `@/components/ui/avatar` - For user avatars
- `@/components/ui/dropdown-menu` - For action menus
- `lucide-react` - For icons
- `@shared/schema` - For User type definition

## Customization

The UserTable component uses the AdvancedTable underneath, so it inherits all the styling and customization options. You can:

1. **Custom Styling**: Pass a `className` prop for custom styles
2. **Action Customization**: Provide your own action handlers
3. **Permission Control**: Use `canPerformAdminActions` to control action visibility
4. **Warehouse Integration**: Provide a `getWarehouseName` function for warehouse lookup

## Examples in Other Pages

You can use this component in any page that needs to display users:

### Admin Dashboard

```tsx
// Display recent users
<UserTable
  data={recentUsers}
  pagination={false}
  searchable={false}
  pageSize={5}
/>
```

### User Management Modal

```tsx
// Display users in a modal
<Dialog>
  <DialogContent className="max-w-4xl">
    <UserTable
      data={allUsers}
      onRowClick={selectUser}
      canPerformAdminActions={false}
      pageSize={8}
    />
  </DialogContent>
</Dialog>
```

### Reports Page

```tsx
// Display users with specific roles
<UserTable
  data={adminUsers}
  groupable={false}
  sortable={true}
  onRowClick={viewUserReport}
/>
```
