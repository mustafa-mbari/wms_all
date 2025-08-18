import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdvancedGenericTable, TableConfig, ColumnConfig } from "@/components/ui/advanced-generic-table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Settings, Plus, Edit, Trash2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Product Attribute interface based on the database schema
interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  type: "text" | "number" | "boolean" | "select" | "multiselect" | "date";
  description?: string;
  isRequired: boolean;
  isFilterable: boolean;
  isSearchable: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  _count?: { options: number; values: number };
}

export default function ProductAttributesPage() {
  const { toast } = useToast();
  const [selectedAttribute, setSelectedAttribute] = useState<ProductAttribute | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch product attributes
  const { data: attributes = [], isLoading, refetch } = useQuery<ProductAttribute[]>({
    queryKey: ["/api/product-attributes"],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Define table columns configuration
  const attributeColumns: ColumnConfig<ProductAttribute>[] = [
    {
      key: "name",
      label: "Attribute Name",
      width: 200,
      sortable: true,
      filterable: true,
      render: (attribute) => (
        <div className="flex items-center space-x-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{attribute.name}</div>
            <div className="text-xs text-muted-foreground font-mono">
              {attribute.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      width: 120,
      sortable: true,
      filterable: true,
      groupable: true,
      filterType: "select",
      filterOptions: [
        { value: "text", label: "Text" },
        { value: "number", label: "Number" },
        { value: "boolean", label: "Boolean" },
        { value: "select", label: "Select" },
        { value: "multiselect", label: "Multi-select" },
        { value: "date", label: "Date" },
      ],
      render: (attribute) => {
        const typeColors = {
          text: "default",
          number: "secondary",
          boolean: "outline",
          select: "destructive",
          multiselect: "destructive",
          date: "outline",
        } as const;
        
        return (
          <Badge variant={typeColors[attribute.type] || "default"}>
            {attribute.type.charAt(0).toUpperCase() + attribute.type.slice(1)}
          </Badge>
        );
      },
    },
    {
      key: "description",
      label: "Description",
      width: 250,
      sortable: true,
      filterable: true,
      render: (attribute) => (
        attribute.description ? (
          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
            {attribute.description}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: "isRequired",
      label: "Required",
      width: 100,
      sortable: true,
      filterable: true,
      groupable: true,
      filterType: "boolean",
      render: (attribute) => (
        <Badge variant={attribute.isRequired ? "default" : "secondary"}>
          {attribute.isRequired ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      key: "isFilterable",
      label: "Filterable",
      width: 100,
      sortable: true,
      filterable: true,
      groupable: true,
      filterType: "boolean",
      render: (attribute) => (
        <Badge variant={attribute.isFilterable ? "default" : "secondary"}>
          {attribute.isFilterable ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      key: "isSearchable",
      label: "Searchable",
      width: 100,
      sortable: true,
      filterable: true,
      groupable: true,
      filterType: "boolean",
      render: (attribute) => (
        <Badge variant={attribute.isSearchable ? "default" : "secondary"}>
          {attribute.isSearchable ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      key: "_count",
      label: "Options/Values",
      width: 120,
      sortable: true,
      render: (attribute) => (
        <div className="text-center space-x-1">
          <Badge variant="outline" className="text-xs">
            {attribute._count?.options || 0} opts
          </Badge>
          <Badge variant="outline" className="text-xs">
            {attribute._count?.values || 0} vals
          </Badge>
        </div>
      ),
    },
    {
      key: "sortOrder",
      label: "Order",
      width: 80,
      sortable: true,
      filterable: true,
      render: (attribute) => (
        <div className="text-center text-sm text-muted-foreground">
          {attribute.sortOrder}
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
      render: (attribute) => (
        <Badge variant={attribute.isActive ? "default" : "destructive"}>
          {attribute.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  // Table configuration
  const tableConfig: TableConfig<ProductAttribute> = {
    columns: attributeColumns,
    entityName: "Attribute",
    entityNamePlural: "Attributes",
    primaryKey: "id",
  };

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: async (attributeId: number) => {
      const response = await apiRequest("DELETE", `/api/product-attributes/${attributeId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Attribute Deleted",
        description: "Product attribute has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/product-attributes"] });
      setIsDeleteDialogOpen(false);
      setSelectedAttribute(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete attribute: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Table event handlers
  const handleAttributeEdit = (attribute: ProductAttribute) => {
    setSelectedAttribute(attribute);
    setIsEditDialogOpen(true);
  };

  const handleAttributeDelete = (attribute: ProductAttribute) => {
    setSelectedAttribute(attribute);
    setIsDeleteDialogOpen(true);
  };

  const handleAttributeView = (attribute: ProductAttribute) => {
    setSelectedAttribute(attribute);
    toast({
      title: "View Attribute",
      description: `Viewing details for ${attribute.name}`,
    });
  };

  const handleBulkAction = (action: string, attributeIds: string[]) => {
    const selectedAttributes = attributes.filter(a => attributeIds.includes(String(a.id)));
    
    switch (action) {
      case "activate":
        toast({
          title: "Bulk Action",
          description: `Activating ${selectedAttributes.length} attributes`,
        });
        break;
      case "deactivate":
        toast({
          title: "Bulk Action",
          description: `Deactivating ${selectedAttributes.length} attributes`,
        });
        break;
      case "makeRequired":
        toast({
          title: "Bulk Action",
          description: `Making ${selectedAttributes.length} attributes required`,
        });
        break;
      case "makeOptional":
        toast({
          title: "Bulk Action",
          description: `Making ${selectedAttributes.length} attributes optional`,
        });
        break;
      case "delete":
        toast({
          title: "Bulk Action",
          description: `Deleting ${selectedAttributes.length} attributes`,
        });
        break;
    }
  };

  const confirmDelete = () => {
    if (selectedAttribute) {
      deleteMutation.mutate(selectedAttribute.id);
    }
  };

  // Custom actions for the table
  const customActions = [
    {
      key: "manageOptions",
      label: "Manage Options",
      icon: <Settings className="h-4 w-4" />,
      onClick: (attribute: ProductAttribute) => {
        toast({
          title: "Manage Options",
          description: `Managing options for ${attribute.name}`,
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
      key: "makeRequired",
      label: "Make Required",
      variant: "outline" as const,
    },
    {
      key: "makeOptional",
      label: "Make Optional",
      variant: "outline" as const,
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
            <h1 className="text-3xl font-bold tracking-tight">Product Attributes</h1>
            <p className="text-muted-foreground">
              Define custom attributes for your products
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Attribute
          </Button>
        </div>

        {/* Generic Table */}
        <AdvancedGenericTable
          data={attributes}
          config={tableConfig}
          loading={isLoading}
          onItemEdit={handleAttributeEdit}
          onItemDelete={handleAttributeDelete}
          onItemView={handleAttributeView}
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
                This action cannot be undone. This will permanently delete the attribute
                "{selectedAttribute?.name}" and all its associated options and values.
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
