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

interface ProductAttributeValue {
  id: number;
  product_id: number;
  attribute_id: number;
  value?: string;
  option_id?: number;
  created_at: string;
  updated_at: string;
  product?: {
    id: number;
    name: string;
    sku: string;
  };
  attribute?: {
    id: number;
    name: string;
    type: string;
  };
  option?: {
    id: number;
    label: string;
    value: string;
  };
}

interface Product {
  id: number;
  name: string;
  sku: string;
}

interface ProductAttribute {
  id: number;
  name: string;
  type: string;
  is_active: boolean;
}

interface AttributeOption {
  id: number;
  attribute_id: number;
  value: string;
  label: string;
}

export default function ProductAttributeValuesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser, isSuperAdmin, hasRole, isAdmin } = useAuth();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState<ProductAttributeValue | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedAttributeId, setSelectedAttributeId] = useState<string>("");
  const [formData, setFormData] = useState({
    product_id: 0,
    attribute_id: 0,
    value: "",
    option_id: 0,
  });

  // Check permissions
  const canManage = isSuperAdmin() || isAdmin() || hasRole('manager');

  // Fetch products for dropdown
  const { data: products } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const result = await response.json();
      return result.data || [];
    },
  });

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

  // Fetch attribute options for selected attribute
  const { data: attributeOptions } = useQuery<AttributeOption[]>({
    queryKey: ["attribute-options", formData.attribute_id],
    queryFn: async () => {
      if (!formData.attribute_id) return [];
      const response = await fetch(`/api/product-attribute-options?attribute_id=${formData.attribute_id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch attribute options");
      }
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!formData.attribute_id,
  });

  // Fetch product attribute values
  const { data: attributeValues, isLoading, error, refetch } = useQuery<ProductAttributeValue[]>({
    queryKey: ["product-attribute-values", selectedProductId, selectedAttributeId],
    queryFn: async () => {
      let url = "/api/product-attribute-values";
      const params = new URLSearchParams();
      if (selectedProductId) params.append("product_id", selectedProductId);
      if (selectedAttributeId) params.append("attribute_id", selectedAttributeId);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch product attribute values");
      }
      const result = await response.json();
      return result.data || [];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/product-attribute-values", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create attribute value");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-attribute-values"] });
      toast({
        title: "Success",
        description: "Attribute value created successfully",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create attribute value: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const response = await fetch(`/api/product-attribute-values/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update attribute value");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-attribute-values"] });
      toast({
        title: "Success",
        description: "Attribute value updated successfully",
      });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update attribute value: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/product-attribute-values/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete attribute value");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-attribute-values"] });
      toast({
        title: "Success",
        description: "Attribute value deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setCurrentValue(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete attribute value: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      product_id: 0,
      attribute_id: 0,
      value: "",
      option_id: 0,
    });
    setCurrentValue(null);
  };

  const handleEdit = (attributeValue: ProductAttributeValue) => {
    setCurrentValue(attributeValue);
    setFormData({
      product_id: attributeValue.product_id,
      attribute_id: attributeValue.attribute_id,
      value: attributeValue.value || "",
      option_id: attributeValue.option_id || 0,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (attributeValue: ProductAttributeValue) => {
    setCurrentValue(attributeValue);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentValue) {
      updateMutation.mutate({ id: currentValue.id, data: formData });
    }
  };

  const getSelectedAttribute = () => {
    return attributes?.find(attr => attr.id === formData.attribute_id);
  };

  const isSelectAttribute = () => {
    const attr = getSelectedAttribute();
    return attr?.type === 'select' || attr?.type === 'multiselect';
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Loading attribute values...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-red-500">Error loading attribute values</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Product Attribute Values
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage attribute values assigned to products
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
                  New Value
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Attribute Value</DialogTitle>
                  <DialogDescription>
                    Assign an attribute value to a product.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="product_id">Product*</Label>
                      <Select
                        value={formData.product_id.toString()}
                        onValueChange={(value) =>
                          setFormData({ ...formData, product_id: parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products?.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} ({product.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="attribute_id">Attribute*</Label>
                      <Select
                        value={formData.attribute_id.toString()}
                        onValueChange={(value) =>
                          setFormData({ ...formData, attribute_id: parseInt(value), option_id: 0, value: "" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an attribute" />
                        </SelectTrigger>
                        <SelectContent>
                          {attributes?.map((attribute) => (
                            <SelectItem key={attribute.id} value={attribute.id.toString()}>
                              {attribute.name} ({attribute.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {isSelectAttribute() ? (
                    <div>
                      <Label htmlFor="option_id">Option*</Label>
                      <Select
                        value={formData.option_id.toString()}
                        onValueChange={(value) =>
                          setFormData({ ...formData, option_id: parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {attributeOptions?.map((option) => (
                            <SelectItem key={option.id} value={option.id.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="value">Value*</Label>
                      {getSelectedAttribute()?.type === 'boolean' ? (
                        <Select
                          value={formData.value}
                          onValueChange={(value) =>
                            setFormData({ ...formData, value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select true or false" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : getSelectedAttribute()?.type === 'date' ? (
                        <Input
                          id="value"
                          type="date"
                          value={formData.value}
                          onChange={(e) =>
                            setFormData({ ...formData, value: e.target.value })
                          }
                          required
                        />
                      ) : getSelectedAttribute()?.type === 'number' ? (
                        <Input
                          id="value"
                          type="number"
                          value={formData.value}
                          onChange={(e) =>
                            setFormData({ ...formData, value: e.target.value })
                          }
                          required
                          placeholder="Enter numeric value"
                        />
                      ) : (
                        <Textarea
                          id="value"
                          value={formData.value}
                          onChange={(e) =>
                            setFormData({ ...formData, value: e.target.value })
                          }
                          required
                          placeholder="Enter attribute value"
                          rows={3}
                        />
                      )}
                    </div>
                  )}

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

      {/* Filters */}
      <div className="mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="filter-product">Filter by Product:</Label>
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All products</SelectItem>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filter-attribute">Filter by Attribute:</Label>
                <Select
                  value={selectedAttributeId}
                  onValueChange={setSelectedAttributeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All attributes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All attributes</SelectItem>
                    {attributes?.map((attribute) => (
                      <SelectItem key={attribute.id} value={attribute.id.toString()}>
                        {attribute.name} ({attribute.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attribute Values</CardTitle>
          <CardDescription>
            {attributeValues?.length || 0} values found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Attribute</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
                {canManage && <TableHead className="w-[100px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {attributeValues?.map((attributeValue) => (
                <TableRow key={attributeValue.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{attributeValue.product?.name}</div>
                      <div className="text-sm text-gray-500 font-mono">
                        {attributeValue.product?.sku}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{attributeValue.attribute?.name}</div>
                      <Badge variant="outline" className="text-xs">
                        {attributeValue.attribute?.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {attributeValue.option ? (
                      <Badge variant="secondary">
                        {attributeValue.option.label}
                      </Badge>
                    ) : (
                      <span className="font-mono text-sm">
                        {attributeValue.value || "-"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {attributeValue.option ? "Option" : "Direct Value"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(attributeValue.created_at).toLocaleDateString()}
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
                          <DropdownMenuItem onClick={() => handleEdit(attributeValue)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(attributeValue)}
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
              {(!attributeValues || attributeValues.length === 0) && (
                <TableRow>
                  <TableCell colSpan={canManage ? 6 : 5} className="text-center py-8">
                    No attribute values found.
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
            <DialogTitle>Edit Attribute Value</DialogTitle>
            <DialogDescription>
              Update the attribute value information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {/* Same form as create with edit- prefixes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-product_id">Product*</Label>
                <Select
                  value={formData.product_id.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, product_id: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-attribute_id">Attribute*</Label>
                <Select
                  value={formData.attribute_id.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, attribute_id: parseInt(value), option_id: 0, value: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an attribute" />
                  </SelectTrigger>
                  <SelectContent>
                    {attributes?.map((attribute) => (
                      <SelectItem key={attribute.id} value={attribute.id.toString()}>
                        {attribute.name} ({attribute.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isSelectAttribute() ? (
              <div>
                <Label htmlFor="edit-option_id">Option*</Label>
                <Select
                  value={formData.option_id.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, option_id: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {attributeOptions?.map((option) => (
                      <SelectItem key={option.id} value={option.id.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label htmlFor="edit-value">Value*</Label>
                {getSelectedAttribute()?.type === 'boolean' ? (
                  <Select
                    value={formData.value}
                    onValueChange={(value) =>
                      setFormData({ ...formData, value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select true or false" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                ) : getSelectedAttribute()?.type === 'date' ? (
                  <Input
                    id="edit-value"
                    type="date"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    required
                  />
                ) : getSelectedAttribute()?.type === 'number' ? (
                  <Input
                    id="edit-value"
                    type="number"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    required
                    placeholder="Enter numeric value"
                  />
                ) : (
                  <Textarea
                    id="edit-value"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    required
                    placeholder="Enter attribute value"
                    rows={3}
                  />
                )}
              </div>
            )}

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
            <DialogTitle>Delete Attribute Value</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this attribute value? This action cannot be undone.
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
              onClick={() => currentValue && deleteMutation.mutate(currentValue.id)}
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
