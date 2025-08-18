import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import InventoryPage from "@/pages/inventory";
import InventoryMovements from "@/pages/inventory/movements";
import InventoryAdjustments from "@/pages/inventory/adjustments";
import ProductsPage from "@/pages/products";
import ProductCategoriesPage from "@/pages/products/categories";
import ProductFamiliesPage from "@/pages/products/families";
import ProductAttributesPage from "@/pages/products/attributes";
import ProductAttributeOptionsPage from "@/pages/products/attribute-options";
import ProductAttributeOptionsSimplePage from "@/pages/products/attribute-options-simple";
import ProductAttributeValuesPage from "@/pages/products/attribute-values";
import ProductAttributeValuesSimplePage from "@/pages/products/attribute-values-simple";
import UnitsOfMeasurePage from "@/pages/products/uom";
import UnitsOfMeasureSimplePage from "@/pages/products/uom-simple";
import OrdersPage from "@/pages/orders";
import WarehousesPage from "@/pages/warehouses";
import UsersPage from "@/pages/users";
import SettingsPage from "@/pages/settings";
import ProfilePage from "@/pages/profile";
import AuthPage from "@/pages/login-simple";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/inventory" component={InventoryPage} />
      <ProtectedRoute path="/inventory/movements" component={InventoryMovements} />
      <ProtectedRoute path="/inventory/adjustments" component={InventoryAdjustments} />
      <ProtectedRoute path="/products/categories" component={ProductCategoriesPage} />
      <ProtectedRoute path="/products/families" component={ProductFamiliesPage} />
      <ProtectedRoute path="/products/attributes" component={ProductAttributesPage} />
      <ProtectedRoute path="/products/attribute-options" component={ProductAttributeOptionsPage} />
      <ProtectedRoute path="/products/attribute-options-simple" component={ProductAttributeOptionsSimplePage} />
      <ProtectedRoute path="/products/attribute-values" component={ProductAttributeValuesPage} />
      <ProtectedRoute path="/products/attribute-values-simple" component={ProductAttributeValuesSimplePage} />
      <ProtectedRoute path="/products/uom" component={UnitsOfMeasurePage} />
      <ProtectedRoute path="/products/uom-simple" component={UnitsOfMeasureSimplePage} />
      <ProtectedRoute path="/products" component={ProductsPage} />
      <ProtectedRoute path="/orders" component={OrdersPage} />
      <ProtectedRoute path="/orders/new" component={OrdersPage} />
      <ProtectedRoute path="/warehouses" component={WarehousesPage} />
      <ProtectedRoute path="/users" component={UsersPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/settings/profile" component={SettingsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
