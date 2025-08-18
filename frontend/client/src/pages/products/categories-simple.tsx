import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AdvancedGenericTable } from "@/components/tables/advanced-generic-table-fixed";
import { ProductCategory, insertProductCategorySchema } from "@shared/schema";
import { ColumnConfig, TableConfig } from "@/components/tables/advanced-generic-table-fixed";
import { Badge } from "@/components/ui/badge";
import { Folder, Tag, TreePine } from "lucide-react";

export default function ProductCategoriesPage() {
  // Column configuration for the categories table
  const columns: ColumnConfig<ProductCategory>[] = [
    {
      key: "name",
      label: "Category Name",
      sortable: true,
      filterable: true,
      groupable: true,
      render: (item) => (
        <div className="flex items-center space-x-2">
          {item.icon ? (
            <span className="text-lg">{item.icon}</span>
          ) : (
            <Folder className="h-4 w-4 text-blue-500" />
          )}
          <div>
            <div className="font-medium">{item.name}</div>
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
      label: "Code",
      sortable: true,
      filterable: true,
      render: (item) => (
        <Badge variant="outline" className="font-mono">
          {item.code || "—"}
        </Badge>
      ),
    },
    {
      key: "level",
      label: "Level",
      sortable: true,
      filterable: true,
      groupable: true,
      render: (item) => (
        <Badge variant="secondary">
          L{item.level || 1}
        </Badge>
      ),
    },
    {
      key: "inventoryType",
      label: "Type",
      sortable: true,
      filterable: true,
      groupable: true,
      render: (item) => {
        const value = item.inventoryType || "PHYSICAL";
        const colorMap = {
          PHYSICAL: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          DIGITAL: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          SERVICE: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        };
        return (
          <Badge className={colorMap[value as keyof typeof colorMap] || "bg-gray-100 text-gray-800"}>
            {value}
          </Badge>
        );
      },
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      filterable: true,
      groupable: true,
      render: (item) => (
        <Badge variant={item.isActive ? "default" : "secondary"}>
          {item.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "isFeatured",
      label: "Featured",
      sortable: true,
      filterable: true,
      groupable: true,
      render: (item) => (
        <Badge variant={item.isFeatured ? "default" : "outline"}>
          {item.isFeatured ? (
            <><Tag className="h-3 w-3 mr-1" />Featured</>
          ) : (
            "Regular"
          )}
        </Badge>
      ),
    },
  ];

  const tableConfig: TableConfig<ProductCategory> = {
    columns,
    entityName: "Category",
    entityNamePlural: "Categories",
    primaryKey: "id",
  };

  // Mock data for testing
  const mockData: ProductCategory[] = [
    {
      id: 1,
      code: "ELEC",
      name: "Electronics",
      classType: null,
      description: "Electronic products and devices",
      parentId: null,
      level: 1,
      sortOrder: 1,
      isActive: true,
      isFeatured: true,
      slug: "electronics",
      metaTitle: "Electronics",
      metaDescription: "Browse our electronics category",
      imageUrl: null,
      icon: "📱",
      colorCode: "#3B82F6",
      inventoryType: "PHYSICAL",
      taxClass: "standard",
      transactionCount: null,
      customAttributes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      createdBy: null,
      updatedBy: null,
      deletedBy: null,
    },
    {
      id: 2,
      code: "CLOTH",
      name: "Clothing",
      classType: null,
      description: "Apparel and clothing items",
      parentId: null,
      level: 1,
      sortOrder: 2,
      isActive: true,
      isFeatured: false,
      slug: "clothing",
      metaTitle: "Clothing",
      metaDescription: "Browse our clothing category",
      imageUrl: null,
      icon: "👕",
      colorCode: "#10B981",
      inventoryType: "PHYSICAL",
      taxClass: "standard",
      transactionCount: null,
      customAttributes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      createdBy: null,
      updatedBy: null,
      deletedBy: null,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Categories</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage product categories to organize your inventory
          </p>
        </div>
        
        <AdvancedGenericTable<ProductCategory> 
          data={mockData}
          config={tableConfig}
          loading={false}
          enableSelection={true}
          enableBulkActions={true}
          enableExport={true}
        />
      </div>
    </DashboardLayout>
  );
}
