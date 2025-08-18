import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AdvancedGenericTable } from '../../components/tables/advanced-generic-table-fixed';

// Mock data for development
const mockAttributeValues = [
  {
    id: 1,
    attribute_id: 1,
    product_id: 100,
    value: 'large',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    attribute: {
      id: 1,
      name: 'Size',
      slug: 'size',
      type: 'select'
    },
    product: {
      id: 100,
      name: 'T-Shirt',
      sku: 'TS-001'
    }
  },
  {
    id: 2,
    attribute_id: 2,
    product_id: 101,
    value: 'blue',
    created_at: '2024-01-16T14:20:00Z',
    updated_at: '2024-01-16T14:20:00Z',
    attribute: {
      id: 2,
      name: 'Color',
      slug: 'color',
      type: 'select'
    },
    product: {
      id: 101,
      name: 'Jeans',
      sku: 'JN-001'
    }
  },
  {
    id: 3,
    attribute_id: 3,
    product_id: 102,
    value: 'cotton',
    created_at: '2024-01-17T09:15:00Z',
    updated_at: '2024-01-17T09:15:00Z',
    attribute: {
      id: 3,
      name: 'Material',
      slug: 'material',
      type: 'text'
    },
    product: {
      id: 102,
      name: 'Shirt',
      sku: 'SH-001'
    }
  }
];

type AttributeValue = typeof mockAttributeValues[0];

export default function ProductAttributeValuesPage() {
  const columnConfig = [
    {
      key: 'product',
      label: 'Product',
      sortable: true,
      filterable: true,
      groupable: true,
      render: (item: AttributeValue) => item?.product?.name || 'N/A',
      width: 150,
    },
    {
      key: 'attribute',
      label: 'Attribute',
      sortable: true,
      filterable: true,
      groupable: true,
      render: (item: AttributeValue) => item?.attribute?.name || 'N/A',
      width: 120,
    },
    {
      key: 'value',
      label: 'Value',
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: 'sku',
      label: 'SKU',
      sortable: true,
      filterable: true,
      render: (item: AttributeValue) => item?.product?.sku || 'N/A',
      width: 120,
    }
  ];

  const tableConfig = {
    title: 'Product Attribute Values',
    description: 'Manage attribute values assigned to specific products',
    searchPlaceholder: 'Search attribute values...',
    enableBulkActions: true,
    enableExport: true,
    enableColumnVisibility: true,
    enableDensity: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    columns: columnConfig,
    entityName: 'attribute value',
    entityNamePlural: 'attribute values',
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <AdvancedGenericTable
          data={mockAttributeValues}
          config={tableConfig}
          onItemEdit={(item: AttributeValue) => console.log('Edit attribute value:', item)}
          onItemDelete={(item: AttributeValue) => console.log('Delete attribute value:', item)}
          onBulkAction={(action: string, items: string[]) => console.log('Bulk action:', action, items)}
        />
      </div>
    </DashboardLayout>
  );
}
