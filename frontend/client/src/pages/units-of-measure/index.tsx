import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdvancedGenericTable, TableConfig, ColumnConfig } from "@/components/ui/advanced-generic-table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Ruler, Plus, Edit, Trash2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Unit of Measure interface based on the database schema
interface UnitOfMeasure {
  id: string;
  name: string;
  symbol: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Additional properties from migration
  uomType?: string;
  conversionFactor?: number;
  baseUomId?: string;
  system?: string;
  category?: string;
  isBaseUnit?: boolean;
  decimalPrecision?: number;
  measurementAccuracy?: number;
  industryStandard?: boolean;
  notes?: string;
  sortOrder?: number;
  // Relations
  baseUom?: { id: string; name: string; symbol: string };
  _count?: { products: number; derivedUnits: number };
}

export default function UnitsOfMeasurePage() {
  const { toast } = useToast();
  const [selectedUnit, setSelectedUnit] = useState<UnitOfMeasure | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch units of measure
  const { data: units = [], isLoading, refetch } = useQuery<UnitOfMeasure[]>({
    queryKey: ["/api/units-of-measure"],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Define table columns configuration
  const unitColumns: ColumnConfig<UnitOfMeasure>[] = [
    {
      key: "name",
      label: "Unit Name",
      width: 200,
      sortable: true,
      filterable: true,
      render: (unit) => (
        <div className="flex items-center space-x-2">
          <Ruler className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{unit.name}</div>
            <div className="text-xs text-muted-foreground font-mono">
              {unit.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "symbol",
      label: "Symbol",
      width: 80,
      sortable: true,
      filterable: true,
      render: (unit) => (
        <Badge variant="outline" className="font-mono">
          {unit.symbol}
        </Badge>
      ),
    },
    {
      key: "uomType",
      label: "Type",
      width: 120,
      sortable: true,
      filterable: true,
      groupable: true,
      filterType: "select",
      filterOptions: [
        { value: "length", label: "Length" },
        { value: "weight", label: "Weight" },
        { value: "volume", label: "Volume" },
        { value: "area", label: "Area" },
        { value: "temperature", label: "Temperature" },
        { value: "time", label: "Time" },
        { value: "quantity", label: "Quantity" },
      ],
      render: (unit) => (
        unit.uomType ? (
          <Badge variant="secondary">
            {unit.uomType.charAt(0).toUpperCase() + unit.uomType.slice(1)}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: "system",
      label: "System",
      width: 100,
      sortable: true,
      filterable: true,
      groupable: true,
      filterType: "select",
      filterOptions: [
        { value: "metric", label: "Metric" },
        { value: "imperial", label: "Imperial" },
        { value: "us", label: "US" },
        { value: "other", label: "Other" },
      ],
      render: (unit) => (
        unit.system ? (
          <Badge variant="outline" className="text-xs">
            {unit.system.toUpperCase()}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: "baseUom",
      label: "Base Unit",
      width: 120,
      sortable: true,
      filterable: true,
      groupable: true,
      render: (unit) => {
        if (unit.isBaseUnit) {
          return <Badge variant="default" className="text-xs">Base Unit</Badge>;
        }
        
        if (unit.baseUom) {
          return (
            <div className="text-sm">
              {unit.baseUom.name} ({unit.baseUom.symbol})
            </div>
          );
        }
        
        return <span className="text-muted-foreground">-</span>;
      },
    },
    {
      key: "conversionFactor",
      label: "Conversion",
      width: 120,
      sortable: true,
      filterable: true,
      render: (unit) => (
        unit.conversionFactor ? (
          <div className="text-sm font-mono">
            {unit.conversionFactor.toLocaleString()}
          </div>
        ) : (
          <span className="text-muted-foreground">1:1</span>
        )
      ),
    },
    {
      key: "decimalPrecision",
      label: "Precision",
      width: 100,
      sortable: true,
      filterable: true,
      render: (unit) => (
        <div className="text-center text-sm">
          {unit.decimalPrecision ?? 2} decimals
        </div>
      ),
    },
    {
      key: "industryStandard",
      label: "Standard",
      width: 100,
      sortable: true,
      filterable: true,
      groupable: true,
      filterType: "boolean",
      render: (unit) => (
        <Badge variant={unit.industryStandard ? "default" : "secondary"}>
          {unit.industryStandard ? "Standard" : "Custom"}
        </Badge>
      ),
    },
    {
      key: "_count",
      label: "Usage",
      width: 100,
      sortable: true,
      render: (unit) => (
        <div className="text-center space-x-1">
          <Badge variant="outline" className="text-xs">
            {unit._count?.products || 0} products
          </Badge>
          {(unit._count?.derivedUnits || 0) > 0 && (
            <Badge variant="outline" className="text-xs">
              {unit._count?.derivedUnits} derived
            </Badge>
          )}
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
      render: (unit) => (
        <Badge variant={unit.isActive ? "default" : "destructive"}>
          {unit.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  // Table configuration
  const tableConfig: TableConfig<UnitOfMeasure> = {
    columns: unitColumns,
    entityName: "Unit of Measure",
    entityNamePlural: "Units of Measure",
    primaryKey: "id",
  };

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: async (unitId: string) => {
      const response = await apiRequest("DELETE", `/api/units-of-measure/${unitId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Unit Deleted",
        description: "Unit of measure has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/units-of-measure"] });
      setIsDeleteDialogOpen(false);
      setSelectedUnit(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete unit: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Table event handlers
  const handleUnitEdit = (unit: UnitOfMeasure) => {
    setSelectedUnit(unit);
    setIsEditDialogOpen(true);
  };

  const handleUnitDelete = (unit: UnitOfMeasure) => {
    setSelectedUnit(unit);
    setIsDeleteDialogOpen(true);
  };

  const handleUnitView = (unit: UnitOfMeasure) => {
    setSelectedUnit(unit);
    toast({
      title: "View Unit",
      description: `Viewing details for ${unit.name}`,
    });
  };

  const handleBulkAction = (action: string, unitIds: string[]) => {
    const selectedUnits = units.filter(u => unitIds.includes(String(u.id)));
    
    switch (action) {
      case "activate":
        toast({
          title: "Bulk Action",
          description: `Activating ${selectedUnits.length} units`,
        });
        break;
      case "deactivate":
        toast({
          title: "Bulk Action",
          description: `Deactivating ${selectedUnits.length} units`,
        });
        break;
      case "standardize":
        toast({
          title: "Bulk Action",
          description: `Marking ${selectedUnits.length} units as industry standard`,
        });
        break;
      case "delete":
        toast({
          title: "Bulk Action",
          description: `Deleting ${selectedUnits.length} units`,
        });
        break;
    }
  };

  const confirmDelete = () => {
    if (selectedUnit) {
      deleteMutation.mutate(selectedUnit.id);
    }
  };

  // Custom actions for the table
  const customActions = [
    {
      key: "createDerived",
      label: "Create Derived Unit",
      icon: <Ruler className="h-4 w-4" />,
      onClick: (unit: UnitOfMeasure) => {
        toast({
          title: "Create Derived Unit",
          description: `Creating derived unit from ${unit.name}`,
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
      key: "standardize",
      label: "Mark as Standard",
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
            <h1 className="text-3xl font-bold tracking-tight">Units of Measure</h1>
            <p className="text-muted-foreground">
              Define measurement units for products and inventory
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Unit
          </Button>
        </div>

        {/* Generic Table */}
        <AdvancedGenericTable
          data={units}
          config={tableConfig}
          loading={isLoading}
          onItemEdit={handleUnitEdit}
          onItemDelete={handleUnitDelete}
          onItemView={handleUnitView}
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
                This action cannot be undone. This will permanently delete the unit
                "{selectedUnit?.name}" and may affect products and derived units that use it.
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
