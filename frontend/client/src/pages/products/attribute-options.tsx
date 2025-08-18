import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Plus, MoreHorizontal, Edit, Trash2, RefreshCw } from "lucide-react";

interface ProductAttributeOption {
  id: number;
  attribute_id: number;
  value: string;
  label: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  attribute?: {
    id: number;
    name: string;
    slug: string;
    type: string;
  };
}

interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  type: string;
  is_active: boolean;
}

export default function ProductAttributeOptionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentOption, setCurrentOption] = useState<ProductAttributeOption | null>(null);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string>("");
  const [formData, setFormData] = useState({
    attribute_id: 0,
    value: "",
    label: "",
    sort_order: 0,
    is_active: true,
  });

  // Check permissions
  const canManage = isSuperAdmin() || isAdmin() || hasRole('manager');

  // Fetch product attributes for dropdown
  const { data: attributes } = useQuery<ProductAttribute[]>({
    queryKey: ["product-attributes"],
    queryFn: async () => {
      const response = await fetch("/api/product-attributes");
      if (!response.ok) {
        throw new Error("Failed to fetch product attributes");
      }
      const result = await response.json();
      return result.data || [];
    },
  });

  // Fetch product attribute options
  const { data: options, isLoading, error, refetch } = useQuery<ProductAttributeOption[]>({
    queryKey: ["product-attribute-options", selectedAttributeId],
    queryFn: async () => {
      let url = "/api/product-attribute-options";
      if (selectedAttributeId) {
        url += `?attribute_id=${selectedAttributeId}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch product attribute options");
      }
      const result = await response.json();
      return result.data || [];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/product-attribute-options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create attribute option");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-attribute-options"] });
      toast({
        title: "Success",
        description: "Attribute option created successfully",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create attribute option: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const response = await fetch(`/api/product-attribute-options/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update attribute option");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-attribute-options"] });
      toast({
        title: "Success",
        description: "Attribute option updated successfully",
      });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update attribute option: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/product-attribute-options/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete attribute option");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-attribute-options"] });
      toast({
        title: "Success",
        description: "Attribute option deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setCurrentOption(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete attribute option: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      attribute_id: 0,
      value: "",
      label: "",
      sort_order: 0,
      is_active: true,
    });
    setCurrentOption(null);
  };

  const handleEdit = (option: ProductAttributeOption) => {
    setCurrentOption(option);
    setFormData({
      attribute_id: option.attribute_id,
      value: option.value,
      label: option.label,
      sort_order: option.sort_order,
      is_active: option.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (option: ProductAttributeOption) => {
    setCurrentOption(option);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentOption) {
      updateMutation.mutate({ id: currentOption.id, data: formData });
    }
  };

  // Filter attributes to only show select/multiselect types
  const selectableAttributes = attributes?.filter(attr => 
    attr.type === 'select' || attr.type === 'multiselect'
  ) || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Loading attribute options...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-red-500">Error loading attribute options</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Product Attribute Options
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage options for select and multi-select attributes
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canManage && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Option
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Attribute Option</DialogTitle>
                  <DialogDescription>
                    Create a new option for a select or multi-select attribute.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="attribute_id">Attribute*</Label>
                    <Select
                      value={formData.attribute_id.toString()}
                      onValueChange={(value) =>
                        setFormData({ ...formData, attribute_id: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an attribute" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectableAttributes.map((attribute) => (
                          <SelectItem key={attribute.id} value={attribute.id.toString()}>
                            {attribute.name} ({attribute.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="value">Value*</Label>
                      <Input
                        id="value"
                        value={formData.value}
                        onChange={(e) =>
                          setFormData({ ...formData, value: e.target.value })
                        }
                        required
                        placeholder="option-value"
                      />
                    </div>
                    <div>
                      <Label htmlFor="label">Label*</Label>
                      <Input
                        id="label"
                        value={formData.label}
                        onChange={(e) =>
                          setFormData({ ...formData, label: e.target.value })
                        }
                        required
                        placeholder="Display Label"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sort_order">Sort Order</Label>
                      <Input
                        id="sort_order"
                        type="number"
                        value={formData.sort_order}
                        onChange={(e) =>
                          setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData({ ...formData, is_active: e.target.checked })
                        }
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? "Creating..." : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filter by Attribute */}
      <div className="mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Label htmlFor="filter-attribute">Filter by Attribute:</Label>
              <Select
                value={selectedAttributeId}
                onValueChange={setSelectedAttributeId}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="All attributes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All attributes</SelectItem>
                  {selectableAttributes.map((attribute) => (
                    <SelectItem key={attribute.id} value={attribute.id.toString()}>
                      {attribute.name} ({attribute.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attribute Options</CardTitle>
          <CardDescription>
            {options?.length || 0} options found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attribute</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                {canManage && <TableHead className="w-[100px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {options?.map((option) => (
                <TableRow key={option.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{option.attribute?.name}</div>
                      <div className="text-sm text-gray-500">
                        <Badge variant="outline" className="text-xs">
                          {option.attribute?.type}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{option.value}</TableCell>
                  <TableCell>{option.label}</TableCell>
                  <TableCell>{option.sort_order}</TableCell>
                  <TableCell>
                    <Badge variant={option.is_active ? "default" : "secondary"}>
                      {option.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(option.created_at).toLocaleDateString()}
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(option)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(option)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {(!options || options.length === 0) && (
                <TableRow>
                  <TableCell colSpan={canManage ? 7 : 6} className="text-center py-8">
                    No attribute options found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Attribute Option</DialogTitle>
            <DialogDescription>
              Update the attribute option information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-attribute_id">Attribute*</Label>
              <Select
                value={formData.attribute_id.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, attribute_id: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an attribute" />
                </SelectTrigger>
                <SelectContent>
                  {selectableAttributes.map((attribute) => (
                    <SelectItem key={attribute.id} value={attribute.id.toString()}>
                      {attribute.name} ({attribute.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-value">Value*</Label>
                <Input
                  id="edit-value"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  required
                  placeholder="option-value"
                />
              </div>
              <div>
                <Label htmlFor="edit-label">Label*</Label>
                <Input
                  id="edit-label"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  required
                  placeholder="Display Label"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-sort_order">Sort Order</Label>
                <Input
                  id="edit-sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="edit-is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <Label htmlFor="edit-is_active">Active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Attribute Option</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the option "{currentOption?.label}"? This action cannot be undone.
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
              onClick={() => currentOption && deleteMutation.mutate(currentOption.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
