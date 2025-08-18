import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdvancedGenericTable, TableConfig, ColumnConfig } from "@/components/ui/advanced-generic-table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { List, Plus, Edit, Trash2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Attribute Option interface based on the database schema
interface AttributeOption {
  id: number;
  attributeId: number;
  value: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  attribute?: { id: number; name: string; type: string };
  _count?: { usages: number };
}

export default function AttributeOptionsPage() {
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<AttributeOption | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch attribute options
  const { data: options = [], isLoading, refetch } = useQuery<AttributeOption[]>({
    queryKey: ["/api/product-attribute-options"],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Define table columns configuration
  const optionColumns: ColumnConfig<AttributeOption>[] = [
    {
      key: "attribute",
      label: "Attribute",
      width: 200,
      sortable: true,
      filterable: true,
      groupable: true,
      render: (option) => (
        option.attribute ? (
          <div className="flex items-center space-x-2">
            <List className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{option.attribute.name}</div>
              <div className="text-xs text-muted-foreground">
                {option.attribute.type}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">Unknown attribute</span>
        )
      ),
    },
    {
      key: "label",
      label: "Option Label",
      width: 200,
      sortable: true,
      filterable: true,
      render: (option) => (
        <div>
          <div className="font-medium">{option.label}</div>
          <div className="text-xs text-muted-foreground font-mono">
            {option.value}
          </div>
        </div>
      ),
    },
    {
      key: "value",
      label: "Value",
      width: 150,
      sortable: true,
      filterable: true,
      render: (option) => (
        <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
          {option.value}
        </div>
      ),
    },
    {
      key: "_count",
      label: "Usage Count",
      width: 100,
      sortable: true,
      render: (option) => (
        <div className="text-center">
          <Badge variant="outline" className="text-xs">
            {option._count?.usages || 0}
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
      render: (option) => (
        <div className="text-center text-sm text-muted-foreground">
          {option.sortOrder}
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
      render: (option) => (
        <Badge variant={option.isActive ? "default" : "destructive"}>
          {option.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      width: 120,
      sortable: true,
      filterable: true,
      render: (option) => (
        <span className="text-sm text-muted-foreground">
          {new Date(option.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Table configuration
  const tableConfig: TableConfig<AttributeOption> = {
    columns: optionColumns,
    entityName: "Attribute Option",
    entityNamePlural: "Attribute Options",
    primaryKey: "id",
  };

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: async (optionId: number) => {
      const response = await apiRequest("DELETE", `/api/product-attribute-options/${optionId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Option Deleted",
        description: "Attribute option has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/product-attribute-options"] });
      setIsDeleteDialogOpen(false);
      setSelectedOption(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete option: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Table event handlers
  const handleOptionEdit = (option: AttributeOption) => {
    setSelectedOption(option);
    setIsEditDialogOpen(true);
  };

  const handleOptionDelete = (option: AttributeOption) => {
    setSelectedOption(option);
    setIsDeleteDialogOpen(true);
  };

  const handleOptionView = (option: AttributeOption) => {
    setSelectedOption(option);
    toast({
      title: "View Option",
      description: `Viewing details for ${option.label}`,
    });
  };

  const handleBulkAction = (action: string, optionIds: string[]) => {
    const selectedOptions = options.filter(o => optionIds.includes(String(o.id)));
    
    switch (action) {
      case "activate":
        toast({
          title: "Bulk Action",
          description: `Activating ${selectedOptions.length} options`,
        });
        break;
      case "deactivate":
        toast({
          title: "Bulk Action",
          description: `Deactivating ${selectedOptions.length} options`,
        });
        break;
      case "reorder":
        toast({
          title: "Bulk Action",
          description: `Reordering ${selectedOptions.length} options`,
        });
        break;
      case "delete":
        toast({
          title: "Bulk Action",
          description: `Deleting ${selectedOptions.length} options`,
        });
        break;
    }
  };

  const confirmDelete = () => {
    if (selectedOption) {
      deleteMutation.mutate(selectedOption.id);
    }
  };

  // Custom actions for the table
  const customActions = [
    {
      key: "duplicate",
      label: "Duplicate",
      icon: <List className="h-4 w-4" />,
      onClick: (option: AttributeOption) => {
        toast({
          title: "Duplicate Option",
          description: `Duplicating ${option.label}`,
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
      key: "reorder",
      label: "Reorder",
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
            <h1 className="text-3xl font-bold tracking-tight">Attribute Options</h1>
            <p className="text-muted-foreground">
              Manage predefined options for select and multi-select attributes
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Option
          </Button>
        </div>

        {/* Generic Table */}
        <AdvancedGenericTable
          data={options}
          config={tableConfig}
          loading={isLoading}
          onItemEdit={handleOptionEdit}
          onItemDelete={handleOptionDelete}
          onItemView={handleOptionView}
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
                This action cannot be undone. This will permanently delete the option
                "{selectedOption?.label}" and may affect products that use this option.
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
