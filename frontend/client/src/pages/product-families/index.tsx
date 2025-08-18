import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdvancedGenericTable, TableConfig, ColumnConfig } from "@/components/ui/advanced-generic-table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Package2, Plus, Edit, Trash2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Product Family interface based on the database schema
interface ProductFamily {
  id: number;
  name: string;
  description?: string;
  categoryId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  category?: { id: number; name: string };
  _count?: { products: number };
}

export default function ProductFamiliesPage() {
  const { toast } = useToast();
  const [selectedFamily, setSelectedFamily] = useState<ProductFamily | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch product families
  const { data: families = [], isLoading, refetch } = useQuery<ProductFamily[]>({
    queryKey: ["/api/product-families"],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Define table columns configuration
  const familyColumns: ColumnConfig<ProductFamily>[] = [
    {
      key: "name",
      label: "Family Name",
      width: 250,
      sortable: true,
      filterable: true,
      render: (family) => (
        <div className="flex items-center space-x-2">
          <Package2 className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{family.name}</div>
            {family.description && (
              <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                {family.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      width: 300,
      sortable: true,
      filterable: true,
      render: (family) => (
        family.description ? (
          <div className="text-sm text-muted-foreground">
            {family.description}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: "category",
      label: "Category",
      width: 180,
      sortable: true,
      filterable: true,
      groupable: true,
      render: (family) => (
        family.category ? (
          <Badge variant="outline">{family.category.name}</Badge>
        ) : (
          <span className="text-muted-foreground">No category</span>
        )
      ),
    },
    {
      key: "_count",
      label: "Products",
      width: 100,
      sortable: true,
      render: (family) => (
        <div className="text-center">
          <Badge variant="outline" className="text-xs">
            {family._count?.products || 0}
          </Badge>
        </div>
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
      render: (family) => (
        <Badge variant={family.isActive ? "default" : "destructive"}>
          {family.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      width: 120,
      sortable: true,
      filterable: true,
      render: (family) => (
        <span className="text-sm text-muted-foreground">
          {new Date(family.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Table configuration
  const tableConfig: TableConfig<ProductFamily> = {
    columns: familyColumns,
    entityName: "Product Family",
    entityNamePlural: "Product Families",
    primaryKey: "id",
  };

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: async (familyId: number) => {
      const response = await apiRequest("DELETE", `/api/product-families/${familyId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product Family Deleted",
        description: "Product family has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/product-families"] });
      setIsDeleteDialogOpen(false);
      setSelectedFamily(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete product family: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Table event handlers
  const handleFamilyEdit = (family: ProductFamily) => {
    setSelectedFamily(family);
    setIsEditDialogOpen(true);
  };

  const handleFamilyDelete = (family: ProductFamily) => {
    setSelectedFamily(family);
    setIsDeleteDialogOpen(true);
  };

  const handleFamilyView = (family: ProductFamily) => {
    setSelectedFamily(family);
    toast({
      title: "View Product Family",
      description: `Viewing details for ${family.name}`,
    });
  };

  const handleBulkAction = (action: string, familyIds: string[]) => {
    const selectedFamilies = families.filter(f => familyIds.includes(String(f.id)));
    
    switch (action) {
      case "activate":
        toast({
          title: "Bulk Action",
          description: `Activating ${selectedFamilies.length} product families`,
        });
        break;
      case "deactivate":
        toast({
          title: "Bulk Action",
          description: `Deactivating ${selectedFamilies.length} product families`,
        });
        break;
      case "delete":
        toast({
          title: "Bulk Action",
          description: `Deleting ${selectedFamilies.length} product families`,
        });
        break;
    }
  };

  const confirmDelete = () => {
    if (selectedFamily) {
      deleteMutation.mutate(selectedFamily.id);
    }
  };

  // Custom actions for the table
  const customActions = [
    {
      key: "viewProducts",
      label: "View Products",
      icon: <Package2 className="h-4 w-4" />,
      onClick: (family: ProductFamily) => {
        toast({
          title: "View Products",
          description: `Viewing products in ${family.name}`,
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
            <h1 className="text-3xl font-bold tracking-tight">Product Families</h1>
            <p className="text-muted-foreground">
              Group related products into families for better organization
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product Family
          </Button>
        </div>

        {/* Generic Table */}
        <AdvancedGenericTable
          data={families}
          config={tableConfig}
          loading={isLoading}
          onItemEdit={handleFamilyEdit}
          onItemDelete={handleFamilyDelete}
          onItemView={handleFamilyView}
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
                This action cannot be undone. This will permanently delete the product family
                "{selectedFamily?.name}". Products in this family will be ungrouped.
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
