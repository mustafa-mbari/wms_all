import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdvancedGenericTable, TableConfig, ColumnConfig } from "@/components/ui/advanced-generic-table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Database, Plus, Edit, Trash2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Attribute Value interface based on the database schema
interface AttributeValue {
  id: number;
  productId: number;
  attributeId: number;
  value?: string;
  optionId?: number;
  createdAt: string;
  updatedAt: string;
  // Relations
  product?: { id: number; name: string; sku: string };
  attribute?: { id: number; name: string; type: string };
  option?: { id: number; label: string; value: string };
}

export default function AttributeValuesPage() {
  const { toast } = useToast();
  const [selectedValue, setSelectedValue] = useState<AttributeValue | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch attribute values
  const { data: values = [], isLoading, refetch } = useQuery<AttributeValue[]>({
    queryKey: ["/api/product-attribute-values"],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Define table columns configuration
  const valueColumns: ColumnConfig<AttributeValue>[] = [
    {
      key: "product",
      label: "Product",
      width: 250,
      sortable: true,
      filterable: true,
      groupable: true,
      render: (value) => (
        value.product ? (
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{value.product.name}</div>
              <div className="text-xs text-muted-foreground font-mono">
                {value.product.sku}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">Unknown product</span>
        )
      ),
    },
    {
      key: "attribute",
      label: "Attribute",
      width: 180,
      sortable: true,
      filterable: true,
      groupable: true,
      render: (value) => (
        value.attribute ? (
          <div>
            <div className="font-medium">{value.attribute.name}</div>
            <Badge variant="outline" className="text-xs">
              {value.attribute.type}
            </Badge>
          </div>
        ) : (
          <span className="text-muted-foreground">Unknown attribute</span>
        )
      ),
    },
    {
      key: "value",
      label: "Value",
      width: 200,
      sortable: true,
      filterable: true,
      render: (value) => {
        if (value.option) {
          return (
            <div>
              <div className="font-medium">{value.option.label}</div>
              <div className="text-xs text-muted-foreground font-mono">
                {value.option.value}
              </div>
            </div>
          );
        }
        
        if (value.value) {
          // Handle different value types
          const attributeType = value.attribute?.type;
          
          if (attributeType === "boolean") {
            const boolValue = value.value === "true" || value.value === "1";
            return (
              <Badge variant={boolValue ? "default" : "secondary"}>
                {boolValue ? "Yes" : "No"}
              </Badge>
            );
          }
          
          if (attributeType === "date") {
            return (
              <span className="text-sm">
                {new Date(value.value).toLocaleDateString()}
              </span>
            );
          }
          
          if (attributeType === "number") {
            return (
              <span className="font-mono text-sm">
                {parseFloat(value.value).toLocaleString()}
              </span>
            );
          }
          
          return (
            <div className="text-sm">
              {value.value.length > 50 ? 
                `${value.value.substring(0, 50)}...` : 
                value.value
              }
            </div>
          );
        }
        
        return <span className="text-muted-foreground">No value</span>;
      },
    },
    {
      key: "createdAt",
      label: "Created",
      width: 120,
      sortable: true,
      filterable: true,
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {new Date(value.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "updatedAt",
      label: "Updated",
      width: 120,
      sortable: true,
      filterable: true,
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {new Date(value.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Table configuration
  const tableConfig: TableConfig<AttributeValue> = {
    columns: valueColumns,
    entityName: "Attribute Value",
    entityNamePlural: "Attribute Values",
    primaryKey: "id",
  };

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: async (valueId: number) => {
      const response = await apiRequest("DELETE", `/api/product-attribute-values/${valueId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Value Deleted",
        description: "Attribute value has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/product-attribute-values"] });
      setIsDeleteDialogOpen(false);
      setSelectedValue(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete value: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Table event handlers
  const handleValueEdit = (value: AttributeValue) => {
    setSelectedValue(value);
    setIsEditDialogOpen(true);
  };

  const handleValueDelete = (value: AttributeValue) => {
    setSelectedValue(value);
    setIsDeleteDialogOpen(true);
  };

  const handleValueView = (value: AttributeValue) => {
    setSelectedValue(value);
    toast({
      title: "View Attribute Value",
      description: `Viewing value for ${value.attribute?.name}`,
    });
  };

  const handleBulkAction = (action: string, valueIds: string[]) => {
    const selectedValues = values.filter(v => valueIds.includes(String(v.id)));
    
    switch (action) {
      case "copyToProducts":
        toast({
          title: "Bulk Action",
          description: `Copying ${selectedValues.length} values to other products`,
        });
        break;
      case "clearValues":
        toast({
          title: "Bulk Action",
          description: `Clearing ${selectedValues.length} values`,
        });
        break;
      case "delete":
        toast({
          title: "Bulk Action",
          description: `Deleting ${selectedValues.length} values`,
        });
        break;
    }
  };

  const confirmDelete = () => {
    if (selectedValue) {
      deleteMutation.mutate(selectedValue.id);
    }
  };

  // Custom actions for the table
  const customActions = [
    {
      key: "copyValue",
      label: "Copy to Other Products",
      icon: <Database className="h-4 w-4" />,
      onClick: (value: AttributeValue) => {
        toast({
          title: "Copy Value",
          description: `Copying ${value.attribute?.name} value to other products`,
        });
      },
    },
  ];

  // Bulk actions
  const bulkActions = [
    {
      key: "copyToProducts",
      label: "Copy to Products",
      variant: "outline" as const,
    },
    {
      key: "clearValues",
      label: "Clear Values",
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
            <h1 className="text-3xl font-bold tracking-tight">Attribute Values</h1>
            <p className="text-muted-foreground">
              View and manage attribute values assigned to products
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Value
          </Button>
        </div>

        {/* Generic Table */}
        <AdvancedGenericTable
          data={values}
          config={tableConfig}
          loading={isLoading}
          onItemEdit={handleValueEdit}
          onItemDelete={handleValueDelete}
          onItemView={handleValueView}
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
                This action cannot be undone. This will permanently delete the attribute value
                for "{selectedValue?.attribute?.name}" from "{selectedValue?.product?.name}".
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
