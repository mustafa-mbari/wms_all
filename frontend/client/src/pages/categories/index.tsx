import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdvancedGenericTable, TableConfig, ColumnConfig } from "@/components/ui/advanced-generic-table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FolderTree, Plus, Edit, Trash2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Category interface based on the database schema
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  parent?: { id: number; name: string };
  children?: Category[];
  _count?: { products: number };
}

export default function CategoriesPage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch categories
  const { data: categories = [], isLoading, refetch } = useQuery<Category[]>({
    queryKey: ["/api/product-categories"],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Define table columns configuration
  const categoryColumns: ColumnConfig<Category>[] = [
    {
      key: "name",
      label: "Category Name",
      width: 250,
      sortable: true,
      filterable: true,
      render: (category) => (
        <div className="flex items-center space-x-2">
          <FolderTree className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{category.name}</div>
            <div className="text-xs text-muted-foreground font-mono">
              {category.slug}
            </div>
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
      render: (category) => (
        category.description ? (
          <div className="text-sm text-muted-foreground truncate max-w-[250px]">
            {category.description}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: "parent",
      label: "Parent Category",
      width: 180,
      sortable: true,
      filterable: true,
      groupable: true,
      render: (category) => (
        category.parent ? (
          <Badge variant="outline">{category.parent.name}</Badge>
        ) : (
          <Badge variant="secondary">Root Category</Badge>
        )
      ),
    },
    {
      key: "_count",
      label: "Products",
      width: 100,
      sortable: true,
      render: (category) => (
        <div className="text-center">
          <Badge variant="outline" className="text-xs">
            {category._count?.products || 0}
          </Badge>
        </div>
      ),
    },
    {
      key: "sortOrder",
      label: "Sort Order",
      width: 100,
      sortable: true,
      filterable: true,
      render: (category) => (
        <div className="text-center text-sm text-muted-foreground">
          {category.sortOrder}
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
      render: (category) => (
        <Badge variant={category.isActive ? "default" : "destructive"}>
          {category.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      width: 120,
      sortable: true,
      filterable: true,
      render: (category) => (
        <span className="text-sm text-muted-foreground">
          {new Date(category.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Table configuration
  const tableConfig: TableConfig<Category> = {
    columns: categoryColumns,
    entityName: "Category",
    entityNamePlural: "Categories",
    primaryKey: "id",
  };

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      const response = await apiRequest("DELETE", `/api/product-categories/${categoryId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Category Deleted",
        description: "Category has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/product-categories"] });
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete category: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Table event handlers
  const handleCategoryEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleCategoryDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleCategoryView = (category: Category) => {
    setSelectedCategory(category);
    toast({
      title: "View Category",
      description: `Viewing details for ${category.name}`,
    });
  };

  const handleBulkAction = (action: string, categoryIds: string[]) => {
    const selectedCategories = categories.filter(c => categoryIds.includes(String(c.id)));
    
    switch (action) {
      case "activate":
        toast({
          title: "Bulk Action",
          description: `Activating ${selectedCategories.length} categories`,
        });
        break;
      case "deactivate":
        toast({
          title: "Bulk Action",
          description: `Deactivating ${selectedCategories.length} categories`,
        });
        break;
      case "delete":
        toast({
          title: "Bulk Action",
          description: `Deleting ${selectedCategories.length} categories`,
        });
        break;
    }
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      deleteMutation.mutate(selectedCategory.id);
    }
  };

  // Custom actions for the table
  const customActions = [
    {
      key: "addSubcategory",
      label: "Add Subcategory",
      icon: <FolderTree className="h-4 w-4" />,
      onClick: (category: Category) => {
        toast({
          title: "Add Subcategory",
          description: `Adding subcategory to ${category.name}`,
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
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">
              Organize your products with hierarchical categories
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        {/* Generic Table */}
        <AdvancedGenericTable
          data={categories}
          config={tableConfig}
          loading={isLoading}
          onItemEdit={handleCategoryEdit}
          onItemDelete={handleCategoryDelete}
          onItemView={handleCategoryView}
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
                This action cannot be undone. This will permanently delete the category
                "{selectedCategory?.name}" and all its subcategories. Products in this category will be uncategorized.
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
