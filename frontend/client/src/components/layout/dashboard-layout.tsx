
import React, { useEffect, useState, ReactNode } from 'react';
import { Link, useLocation } from "wouter";
import { 
  Home,
  Package, 
  Warehouse,
  Users,
  Settings,
  BarChart3,
  ChevronRight,
  User,
  LogOut,
  Bell,
  Sun,
  Moon
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/ui/theme-provider";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { 
    name: "Products", 
    href: "/products", 
    icon: Package,
    children: [
      { name: "Products", href: "/products" },
      { name: "Categories", href: "/products/categories" },
      { name: "Product Families", href: "/products/families" },
      { name: "Attributes", href: "/products/attributes" },
      { name: "Attribute Options", href: "/products/attribute-options" },
      { name: "Attribute Values", href: "/products/attribute-values" },
      { name: "Units of Measure", href: "/products/uom" },
    ]
  },
  { 
    name: "Inventory", 
    href: "/inventory", 
    icon: BarChart3,
    children: [
      { name: "Current Stock", href: "/inventory" },
      { name: "Adjustments", href: "/inventory/adjustments" },
      { name: "Movements", href: "/inventory/movements" },
    ]
  },
  { name: "Warehouses", href: "/warehouses", icon: Warehouse },
  { name: "Users", href: "/users", icon: Users },
  { name: "System", href: "/settings", icon: Settings },
];

function AppSidebar() {
  const [location] = useLocation();
  const [manuallyOpenMenus, setManuallyOpenMenus] = useState<string[]>([]);
  const { isSuperAdmin, isAdmin, hasRole } = useAuth();

  // Filter menu items based on user permissions
  const getFilteredMenuItems = () => {
    return navigation.filter((item: any) => {
      // Users page - only accessible to Super Admin, Admin, and Manager
      if (item.href === "/users") {
        return isSuperAdmin() || isAdmin() || hasRole('manager');
      }
      // All other pages are accessible to everyone
      return true;
    });
  };

  const filteredMenuItems = getFilteredMenuItems();

  // Calculate which menus should be open based on current location
  const getAutoOpenMenus = () => {
    if (location.startsWith('/products')) {
      return ['Products'];
    } else if (location.startsWith('/inventory')) {
      return ['Inventory'];
    }
    return [];
  };

  // Combine auto-opened menus with manually opened ones
  const openMenus = Array.from(new Set([...getAutoOpenMenus(), ...manuallyOpenMenus]));

  // Toggle submenu and close others
  const toggleMenu = (menuName: string) => {
    const autoOpenMenus = getAutoOpenMenus();
    
    setManuallyOpenMenus(prev => {
      if (openMenus.includes(menuName)) {
        // If it's an auto-opened menu, don't close it
        if (autoOpenMenus.includes(menuName)) {
          return prev;
        }
        // Otherwise, remove it from manually opened
        return prev.filter(name => name !== menuName);
      } else {
        // Add to manually opened
        return [...prev.filter(name => name !== menuName), menuName];
      }
    });
  };

  return (
    <Sidebar variant="inset" className="border-r">
      <SidebarHeader>
        <div className="flex h-12 items-center gap-2 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-md">
            <Package className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-foreground">WMS</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {filteredMenuItems.map((item) => {
                const isActive = location === item.href || 
                  (item.href !== "/" && location.startsWith(item.href));
                const isMenuOpen = openMenus.includes(item.name);

                if (item.children) {
                  return (
                    <Collapsible 
                      key={item.name} 
                      open={isMenuOpen} 
                      onOpenChange={() => toggleMenu(item.name)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton 
                            isActive={isActive}
                            className={cn(
                              "w-full justify-between rounded-md transition-all duration-300 ease-in-out",
                              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              isActive && "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <item.icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </div>
                            <ChevronRight 
                              className={cn(
                                "h-4 w-4 transition-transform duration-300 ease-in-out",
                                isMenuOpen && "rotate-90"
                              )} 
                            />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="transition-all duration-300 ease-in-out overflow-hidden">
                          <SidebarMenuSub className="ml-4 mt-1 border-l border-sidebar-border/50">
                            {item.children.map((child) => {
                              const childIsActive = location === child.href;
                              return (
                                <SidebarMenuSubItem key={child.name}>
                                  <SidebarMenuSubButton 
                                    asChild 
                                    isActive={childIsActive}
                                    className={cn(
                                      "rounded-md transition-all duration-300 ease-in-out",
                                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                      childIsActive && "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                                    )}
                                  >
                                    <Link href={child.href}>
                                      <span>{child.name}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={cn(
                        "rounded-md transition-all duration-300 ease-in-out",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isActive && "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 text-xs text-muted-foreground border-t">
          Warehouse Management System v1.0
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const handleThemeToggle = () => {
    console.log("Current theme before toggle:", theme);
    const newTheme = theme === "dark" ? "light" : "dark";
    console.log("Switching to theme:", newTheme);
    setTheme(newTheme);
  };

  // Simple theme display - if not mounted, default to light
  const displayTheme = mounted ? theme : "light";

  const getUserInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.username || 'User';
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
            <h1 className="text-lg font-semibold">Warehouse Management System</h1>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            
            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleThemeToggle}
              title={`Switch to ${displayTheme === "dark" ? "light" : "dark"} mode`}
            >
              {displayTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium leading-none">
                        {getUserDisplayName(user)}
                      </span>
                      <div className="flex gap-1">
                        {(user as any)?.role_names && (user as any)?.role_names.length > 0 ? (
                          (user as any).role_names.map((role: string) => (
                            <Badge 
                              key={role}
                              variant={getRoleBadgeVariant(role.toLowerCase())}
                              className="text-xs"
                            >
                              {role}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            No Role
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-normal text-muted-foreground">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
