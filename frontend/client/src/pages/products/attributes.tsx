import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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

interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  type: "text" | "number" | "boolean" | "select" | "multiselect" | "date";
  description?: string;
  is_required: boolean;
  is_filterable: boolean;
  is_searchable: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const attributeTypes = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "select", label: "Select (Single)" },
  { value: "multiselect", label: "Multi-Select" },
  { value: "date", label: "Date" },
];

export default function ProductAttributesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAttribute, setCurrentAttribute] = useState<ProductAttribute | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "text" as ProductAttribute["type"],
    description: "",
    is_required: false,
    is_filterable: false,
    is_searchable: false,
    sort_order: 0,
    is_active: true,
  });

  // Check permissions
  const canManage = isSuperAdmin() || isAdmin() || hasRole('manager');

  // Fetch product attributes
  const { data: attributes, isLoading, error, refetch } = useQuery<ProductAttribute[]>({
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

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/product-attributes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create product attribute");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-attributes"] });
      toast({
        title: "Success",
        description: "Product attribute created successfully",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create product attribute: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const response = await fetch(`/api/product-attributes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update product attribute");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-attributes"] });
      toast({
        title: "Success",
        description: "Product attribute updated successfully",
      });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update product attribute: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/product-attributes/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete product attribute");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-attributes"] });
      toast({
        title: "Success",
        description: "Product attribute deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setCurrentAttribute(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete product attribute: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      type: "text",
      description: "",
      is_required: false,
      is_filterable: false,
      is_searchable: false,
      sort_order: 0,
      is_active: true,
    });
    setCurrentAttribute(null);
  };

  const handleEdit = (attribute: ProductAttribute) => {
    setCurrentAttribute(attribute);
    setFormData({
      name: attribute.name,
      slug: attribute.slug,
      type: attribute.type,
      description: attribute.description || "",
      is_required: attribute.is_required,
      is_filterable: attribute.is_filterable,
      is_searchable: attribute.is_searchable,
      sort_order: attribute.sort_order,
      is_active: attribute.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (attribute: ProductAttribute) => {
    setCurrentAttribute(attribute);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAttribute) {
      updateMutation.mutate({ id: currentAttribute.id, data: formData });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Loading product attributes...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-red-500">Error loading product attributes</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Product Attributes
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage product attributes and their properties
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
                  New Attribute
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Product Attribute</DialogTitle>
                  <DialogDescription>
                    Create a new product attribute to describe product properties.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name*</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setFormData({ 
                            ...formData, 
                            name,
                            slug: generateSlug(name)
                          });
                        }}
                        required
                        placeholder="Enter attribute name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug*</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                        required
                        placeholder="attribute-slug"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type*</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: ProductAttribute["type"]) =>
                          setFormData({ ...formData, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {attributeTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Enter attribute description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_required"
                          checked={formData.is_required}
                          onChange={(e) =>
                            setFormData({ ...formData, is_required: e.target.checked })
                          }
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="is_required">Required</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_filterable"
                          checked={formData.is_filterable}
                          onChange={(e) =>
                            setFormData({ ...formData, is_filterable: e.target.checked })
                          }
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="is_filterable">Filterable</Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_searchable"
                          checked={formData.is_searchable}
                          onChange={(e) =>
                            setFormData({ ...formData, is_searchable: e.target.checked })
                          }
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="is_searchable">Searchable</Label>
                      </div>
                      <div className="flex items-center space-x-2">
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

      <Card>
        <CardHeader>
          <CardTitle>Product Attributes</CardTitle>
          <CardDescription>
            {attributes?.length || 0} attributes found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sort Order</TableHead>
                {canManage && <TableHead className="w-[100px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {attributes?.map((attribute) => (
                <TableRow key={attribute.id}>
                  <TableCell className="font-medium">{attribute.name}</TableCell>
                  <TableCell className="font-mono text-sm">{attribute.slug}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {attributeTypes.find(t => t.value === attribute.type)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {attribute.is_required && <Badge variant="secondary" className="text-xs">Required</Badge>}
                      {attribute.is_filterable && <Badge variant="secondary" className="text-xs">Filterable</Badge>}
                      {attribute.is_searchable && <Badge variant="secondary" className="text-xs">Searchable</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={attribute.is_active ? "default" : "secondary"}>
                      {attribute.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{attribute.sort_order}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEdit(attribute)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(attribute)}
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
              {(!attributes || attributes.length === 0) && (
                <TableRow>
                  <TableCell colSpan={canManage ? 7 : 6} className="text-center py-8">
                    No product attributes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product Attribute</DialogTitle>
            <DialogDescription>
              Update the product attribute information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {/* Same form fields as create, but with edit- prefixes for IDs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name*</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({ 
                      ...formData, 
                      name,
                      slug: generateSlug(name)
                    });
                  }}
                  required
                  placeholder="Enter attribute name"
                />
              </div>
              <div>
                <Label htmlFor="edit-slug">Slug*</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                  placeholder="attribute-slug"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-type">Type*</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: ProductAttribute["type"]) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {attributeTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter attribute description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-is_required"
                    checked={formData.is_required}
                    onChange={(e) =>
                      setFormData({ ...formData, is_required: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="edit-is_required">Required</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-is_filterable"
                    checked={formData.is_filterable}
                    onChange={(e) =>
                      setFormData({ ...formData, is_filterable: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="edit-is_filterable">Filterable</Label>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-is_searchable"
                    checked={formData.is_searchable}
                    onChange={(e) =>
                      setFormData({ ...formData, is_searchable: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="edit-is_searchable">Searchable</Label>
                </div>
                <div className="flex items-center space-x-2">
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
            <DialogTitle>Delete Product Attribute</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{currentAttribute?.name}"? This action cannot be undone.
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
              onClick={() => currentAttribute && deleteMutation.mutate(currentAttribute.id)}
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
