import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdvancedGenericTable, TableConfig, ColumnConfig } from "@/components/ui/advanced-generic-table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Edit, Trash2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Product interface based on the database schema
interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  categoryId?: number;
  uomId?: string;
  price?: number;
  cost?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  leadTime?: number;
  isActive: boolean;
  imageUrl?: string;
  barcode?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  category?: { id: number; name: string };
  uom?: { id: string; name: string };
}

export default function ProductsGenericPage() {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch products
  const { data: products = [], isLoading, refetch } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

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
        <div>
          <div className="font-medium">{product.name}</div>
          {product.description && (
            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
              {product.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      width: 150,
      sortable: true,
      filterable: true,
      groupable: true,
      render: (product) => (
        product.category ? (
          <Badge variant="outline">{product.category.name}</Badge>
        ) : (
          <span className="text-muted-foreground">No category</span>
        )
      ),
    },
    {
      key: "price",
      label: "Price",
      width: 100,
      sortable: true,
      filterable: true,
      render: (product) => (
        product.price ? (
          <span className="font-medium">${product.price.toFixed(2)}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: "cost",
      label: "Cost",
      width: 100,
      sortable: true,
      filterable: true,
      render: (product) => (
        product.cost ? (
          <span className="text-sm">${product.cost.toFixed(2)}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: "uom",
      label: "Unit",
      width: 80,
      sortable: true,
      filterable: true,
      render: (product) => (
        product.uom ? (
          <Badge variant="secondary" className="text-xs">{product.uom.name}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
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

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await apiRequest("DELETE", `/api/products/${productId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Table event handlers
  const handleProductEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleProductDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleProductView = (product: Product) => {
    setSelectedProduct(product);
    // You can implement a view dialog or navigate to a detail page
    toast({
      title: "View Product",
      description: `Viewing details for ${product.name}`,
    });
  };

  const handleBulkAction = (action: string, productIds: string[]) => {
    const selectedProducts = products.filter(p => productIds.includes(String(p.id)));
    
    switch (action) {
      case "activate":
        toast({
          title: "Bulk Action",
          description: `Activating ${selectedProducts.length} products`,
        });
        break;
      case "deactivate":
        toast({
          title: "Bulk Action",
          description: `Deactivating ${selectedProducts.length} products`,
        });
        break;
      case "delete":
        toast({
          title: "Bulk Action",
          description: `Deleting ${selectedProducts.length} products`,
        });
        break;
    }
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      deleteMutation.mutate(selectedProduct.id);
    }
  };

  // Custom actions for the table
  const customActions = [
    {
      key: "duplicate",
      label: "Duplicate",
      icon: <Package className="h-4 w-4" />,
      onClick: (product: Product) => {
        toast({
          title: "Duplicate Product",
          description: `Duplicating ${product.name}`,
        });
      },
    },
  ];

  // Bulk actions
  const bulkActions = [
    {
      key: "activate",
      label: "Activate",
      variant: "default" as const,
    },
    {
      key: "deactivate",
      label: "Deactivate",
      variant: "secondary" as const,
    },
    {
      key: "delete",
      label: "Delete",
      variant: "destructive" as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">
              Manage your product catalog and inventory
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Generic Table */}
        <AdvancedGenericTable
          data={products}
          config={tableConfig}
          loading={isLoading}
          onItemEdit={handleProductEdit}
          onItemDelete={handleProductDelete}
          onItemView={handleProductView}
          onBulkAction={handleBulkAction}
          customActions={customActions}
          bulkActions={bulkActions}
          enableSelection={true}
          enableBulkActions={true}
          enableExport={true}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the product
                "{selectedProduct?.name}" and remove it from our servers.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create/Edit dialogs would go here */}
        {/* You can implement these based on your existing user forms */}
      </div>
    </DashboardLayout>
  );
}
