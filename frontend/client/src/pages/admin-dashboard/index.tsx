import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { WmTable, type UserWithRoles } from "@/components/tables/wm-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Users, UserPlus, Shield, Activity } from "lucide-react";

export default function AdminDashboard() {
  const { isSuperAdmin, isAdmin } = useAuth();

  // Fetch recent users (last 10)
  const { data: usersData, isLoading } = useQuery<UserWithRoles[]>({
    queryKey: ["/api/users"],
    enabled: isSuperAdmin() || isAdmin(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache for dashboard
  });

  // Get only the most recent 10 users
  const recentUsers = usersData?.slice(0, 10) || [];

  // Mock warehouse data for demonstration
  const getWarehouseName = (warehouseId?: string) => {
    const warehouses: Record<string, string> = {
      "1": "Main Warehouse",
      "2": "Secondary Warehouse", 
      "3": "Distribution Center"
    };
    return warehouses[warehouseId || ""] || warehouseId || "—";
  };

  const handleUserClick = (user: UserWithRoles) => {
    console.log("View user details:", user.username);
    // Navigate to user detail page or open modal
  };

  if (!isSuperAdmin() && !isAdmin()) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view the admin dashboard.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of system users and recent activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usersData?.length || 0}</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usersData?.filter((u: UserWithRoles) => u.isActive).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Currently online</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Week</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">+25% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrators</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usersData?.filter((u: UserWithRoles) => u.isAdmin || u.role_slugs?.includes('admin')).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">System admins</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>
              Latest users registered in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <WmTable
                data={recentUsers}
                onRowClick={handleUserClick}
                getWarehouseName={getWarehouseName}
                canPerformAdminActions={false} // Read-only view for dashboard
                searchable={false} // Disable search for compact view
                groupable={false} // Disable grouping for dashboard
                sortable={true}
                pagination={false} // Show all recent users
                className="border-0" // Remove border for card integration
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
