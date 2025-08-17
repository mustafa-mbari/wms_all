import React from "react";
import { AdvancedTable, type ColumnDef } from "@/components/ui/advanced-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  MailIcon,
  PhoneIcon,
  Building,
  ShieldIcon,
  KeyIcon,
} from "lucide-react";
import { User } from "@shared/schema";

// Extended User type with role information from the API
export interface UserWithRoles extends User {
  role_names?: string[];
  role_slugs?: string[];
}

export interface UserTableProps {
  /** Array of users to display */
  data: UserWithRoles[];
  /** Callback when a user row is clicked */
  onRowClick?: (user: UserWithRoles) => void;
  /** Callback when edit button is clicked */
  onEdit?: (user: UserWithRoles) => void;
  /** Callback when delete button is clicked */
  onDelete?: (user: UserWithRoles) => void;
  /** Callback when manage roles is clicked */
  onManageRoles?: (user: UserWithRoles) => void;
  /** Callback when change password is clicked */
  onChangePassword?: (user: UserWithRoles) => void;
  /** Whether the current user can perform admin actions */
  canPerformAdminActions?: boolean;
  /** Function to get warehouse name by ID */
  getWarehouseName?: (warehouseId?: string) => string;
  /** Custom className for the table */
  className?: string;
  /** Whether to show search functionality */
  searchable?: boolean;
  /** Whether to show grouping functionality */
  groupable?: boolean;
  /** Whether to show sorting functionality */
  sortable?: boolean;
  /** Whether to show pagination */
  pagination?: boolean;
  /** Number of items per page */
  pageSize?: number;
}

// Get initials for avatar
const getUserInitials = (user: User): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  }
  return user.username.substring(0, 2).toUpperCase();
};

export const UserTable: React.FC<UserTableProps> = ({
  data,
  onRowClick,
  onEdit,
  onDelete,
  onManageRoles,
  onChangePassword,
  canPerformAdminActions = false,
  getWarehouseName = (warehouseId?: string) => warehouseId || "—",
  className,
  searchable = true,
  groupable = true,
  sortable = true,
  pagination = true,
  pageSize = 10,
}) => {
  // Define columns for the user table
  const columns: ColumnDef<UserWithRoles>[] = [
    {
      id: "username",
      header: "Username",
      accessorKey: "username",
      cell: (value, row) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100">
              {getUserInitials(row)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      id: "name",
      header: "Name",
      accessorKey: "firstName",
      cell: (_, row) => {
        return row.firstName && row.lastName
          ? `${row.firstName} ${row.lastName}`
          : "—";
      },
    },
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
      cell: (value, row) => (
        <div>
          <div className="flex items-center">
            <MailIcon className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-muted-foreground">{value}</span>
          </div>
          {row.phone && (
            <div className="text-xs text-muted-foreground flex items-center mt-1">
              <PhoneIcon className="h-3 w-3 mr-1" />
              {row.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      accessorKey: "role_names",
      cell: (_, row) => (
        <div>
          {row.role_names && row.role_names.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {row.role_names.map((roleName: string, index: number) => (
                <Badge 
                  key={index}
                  variant={roleName.toLowerCase().includes('admin') ? "default" : "outline"}
                >
                  {roleName}
                </Badge>
              ))}
            </div>
          ) : row.isAdmin ? (
            <Badge variant="default">Administrator</Badge>
          ) : (
            <Badge variant="outline">User</Badge>
          )}
          {row.defaultWarehouseId && (
            <div className="text-xs text-muted-foreground flex items-center mt-1">
              <Building className="h-3 w-3 mr-1" />
              {getWarehouseName(row.defaultWarehouseId)}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "isActive",
      cell: (value, row) => (
        <div>
          {value ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              <CheckCircle className="mr-1 h-3 w-3" /> Active
            </Badge>
          ) : (
            <Badge variant="outline" className="border-red-200 text-red-800 dark:border-red-800 dark:text-red-300">
              <XCircle className="mr-1 h-3 w-3" /> Inactive
            </Badge>
          )}
          {row.lastLogin && (
            <div className="text-xs text-muted-foreground mt-1">
              Last login: {new Date(row.lastLogin).toLocaleDateString()}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (_, row) => (
        <div className="flex items-center gap-1">
          {canPerformAdminActions && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(row);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(row);
                }}
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
              
              {canPerformAdminActions && (
                <>
                  <DropdownMenuItem onClick={() => onEdit?.(row)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onManageRoles?.(row)}>
                    <ShieldIcon className="mr-2 h-4 w-4" /> Manage Roles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChangePassword?.(row)}>
                    <KeyIcon className="mr-2 h-4 w-4" /> Change Password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(row)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </>
              )}
              
              {!canPerformAdminActions && (
                <DropdownMenuItem disabled>
                  <span className="text-muted-foreground">No actions available</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <AdvancedTable
      data={data}
      columns={columns}
      onRowClick={onRowClick}
      searchable={searchable}
      groupable={groupable}
      sortable={sortable}
      pagination={pagination}
      pageSize={pageSize}
      className={className}
    />
  );
};

export default UserTable;
