import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AdvancedGenericTable } from "@/components/tables/advanced-generic-table-fixed";
import { ProductCategory, insertProductCategorySchema } from "@shared/schema";
import { ColumnConfig } from "@/components/tables/advanced-generic-table-fixed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Folder, Tag, TreePine, Edit, Trash2 } from "lucide-react";
import { z } from "zod";

export default function ProductCategoriesPage() {
  // Define form schema for category CRUD operations
  const categoryFormSchema = insertProductCategorySchema
    .extend({
      parentId: z.number().optional().nullable(),
      isActive: z.boolean().default(true),
      isFeatured: z.boolean().default(false),
    });

  // Column configuration for the categories table
  const columns: ColumnConfig<ProductCategory>[] = [
    {
      key: "name",
      header: "Category Name",
      sortable: true,
      filterable: true,
      groupable: true,
      width: "300px",
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          {item.icon ? (
            <span className="text-lg">{item.icon}</span>
          ) : (
            <Folder className="h-4 w-4 text-blue-500" />
          )}
          <div>
            <div className="font-medium">{value}</div>
            {item.description && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {item.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "code",
      header: "Code",
      sortable: true,
      filterable: true,
      width: "120px",
      render: (value) => (
        <Badge variant="outline" className="font-mono">
          {value || "—"}
        </Badge>
      ),
    },
    {
      key: "level",
      header: "Level",
      sortable: true,
      filterable: true,
      groupable: true,
      width: "80px",
      render: (value) => (
        <Badge variant="secondary">
          L{value || 1}
        </Badge>
      ),
    },
    {
      key: "parentId",
      header: "Parent Category",
      sortable: true,
      filterable: true,
      groupable: true,
      width: "200px",
      render: (value, _item, allData) => {
        if (!value) return <span className="text-gray-500">Root Category</span>;
        const parent = allData?.find((cat: ProductCategory) => cat.id === value);
        return (
          <div className="flex items-center space-x-1">
            <TreePine className="h-3 w-3 text-green-500" />
            <span>{parent?.name || "Unknown"}</span>
          </div>
        );
      },
    },
    {
      key: "inventoryType",
      header: "Type",
      sortable: true,
      filterable: true,
      groupable: true,
      width: "120px",
      render: (value) => {
        const colorMap = {
          PHYSICAL: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          DIGITAL: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          SERVICE: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        };
        return (
          <Badge className={colorMap[value as keyof typeof colorMap] || "bg-gray-100 text-gray-800"}>
            {value || "PHYSICAL"}
          </Badge>
        );
      },
    },
    {
      key: "isActive",
      header: "Status",
      sortable: true,
      filterable: true,
      groupable: true,
      width: "100px",
      render: (value) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "isFeatured",
      header: "Featured",
      sortable: true,
      filterable: true,
      groupable: true,
      width: "100px",
      render: (value) => (
        <Badge variant={value ? "default" : "outline"}>
          {value ? (
            <><Tag className="h-3 w-3 mr-1" />Featured</>
          ) : (
            "Regular"
          )}
        </Badge>
      ),
    },
    {
      key: "sortOrder",
      header: "Sort Order",
      sortable: true,
      width: "100px",
      render: (value) => (
        <span className="font-mono text-sm">{value || 0}</span>
      ),
    },
  ];

  // Form field configuration for CRUD operations
  const formFields = [
    {
      name: "name",
      label: "Name",
      type: "text" as const,
      required: true,
      placeholder: "Category name",
      description: "The display name of the category",
    },
    {
      name: "code",
      label: "Code",
      type: "text" as const,
      placeholder: "Unique code",
      description: "Optional unique identifier for the category",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea" as const,
      placeholder: "Category description",
      description: "Optional description of the category",
    },
    {
      name: "parentId",
      label: "Parent Category",
      type: "select" as const,
      placeholder: "Select parent category",
      description: "Choose a parent category to create a hierarchy",
      options: [], // Will be populated by the table component
    },
    {
      name: "level",
      label: "Level",
      type: "number" as const,
      defaultValue: 1,
      min: 1,
      max: 10,
      description: "The hierarchy level of this category",
    },
    {
      name: "inventoryType",
      label: "Inventory Type",
      type: "select" as const,
      defaultValue: "PHYSICAL",
      options: [
        { value: "PHYSICAL", label: "Physical Product" },
        { value: "DIGITAL", label: "Digital Product" },
        { value: "SERVICE", label: "Service" },
      ],
      description: "Type of products this category contains",
    },
    {
      name: "slug",
      label: "URL Slug",
      type: "text" as const,
      placeholder: "category-url-slug",
      description: "URL-friendly version of the name",
    },
    {
      name: "imageUrl",
      label: "Image URL",
      type: "text" as const,
      placeholder: "https://example.com/image.jpg",
      description: "Optional image for the category",
    },
    {
      name: "icon",
      label: "Icon",
      type: "text" as const,
      placeholder: "🏷️",
      description: "Optional emoji or icon",
    },
    {
      name: "colorCode",
      label: "Color Code",
      type: "text" as const,
      placeholder: "#3B82F6",
      description: "Optional hex color code",
    },
    {
      name: "metaTitle",
      label: "Meta Title",
      type: "text" as const,
      placeholder: "SEO title",
      description: "Title for search engines",
    },
    {
      name: "metaDescription",
      label: "Meta Description",
      type: "textarea" as const,
      placeholder: "SEO description",
      description: "Description for search engines",
    },
    {
      name: "taxClass",
      label: "Tax Class",
      type: "text" as const,
      placeholder: "standard",
      description: "Tax classification for products in this category",
    },
    {
      name: "sortOrder",
      label: "Sort Order",
      type: "number" as const,
      defaultValue: 0,
      description: "Order for displaying categories",
    },
    {
      name: "isActive",
      label: "Active",
      type: "boolean" as const,
      defaultValue: true,
      description: "Whether this category is active",
    },
    {
      name: "isFeatured",
      label: "Featured",
      type: "boolean" as const,
      defaultValue: false,
      description: "Whether this category is featured",
    },
  ];

  const tableConfig = {
    title: "Product Categories",
    description: "Manage product categories to organize your inventory",
    apiEndpoint: "/api/product-categories",
    columns,
    formFields,
    formSchema: categoryFormSchema,
    searchFields: ["name", "code", "description"],
    defaultSort: { field: "name", direction: "asc" as const },
    pageSize: 10,
    enableGrouping: true,
    enableFiltering: true,
    enableBulkActions: true,
    enableRowActions: true,
    createButtonText: "New Category",
    createDialogTitle: "Create New Category",
    editDialogTitle: "Edit Category",
    deleteDialogTitle: "Delete Category",
    icons: {
      create: <Tag className="h-4 w-4" />,
      edit: <Edit className="h-4 w-4" />,
      delete: <Trash2 className="h-4 w-4" />,
      search: <Folder className="h-4 w-4" />,
    },
  };

  return (
    <DashboardLayout>
      <AdvancedGenericTable<ProductCategory> config={tableConfig} />
    </DashboardLayout>
  );
}
