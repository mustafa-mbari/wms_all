import React from 'react';
import { AdvancedGenericTable } from '../../components/tables/advanced-generic-table-fixed';

// Mock data for development
const mockAttributeOptions = [
  {
    id: 1,
    attribute_id: 1,
    value: 'small',
    label: 'Small',
    sort_order: 1,
    is_active: true,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    attribute: {
      id: 1,
      name: 'Size',
      slug: 'size',
      type: 'select'
    }
  },
  {
    id: 2,
    attribute_id: 1,
    value: 'medium',
    label: 'Medium',
    sort_order: 2,
    is_active: true,
    created_at: '2024-01-16T14:20:00Z',
    updated_at: '2024-01-16T14:20:00Z',
    attribute: {
      id: 1,
      name: 'Size',
      slug: 'size',
      type: 'select'
    }
  },
  {
    id: 3,
    attribute_id: 2,
    value: 'red',
    label: 'Red',
    sort_order: 1,
    is_active: false,
    created_at: '2024-01-17T09:15:00Z',
    updated_at: '2024-01-17T09:15:00Z',
    attribute: {
      id: 2,
      name: 'Color',
      slug: 'color',
      type: 'select'
    }
  }
];

type AttributeOption = typeof mockAttributeOptions[0];

export default function ProductAttributeOptionsPage() {
  const columnConfig = [
    {
      key: 'attribute',
      label: 'Attribute',
      sortable: true,
      filterable: true,
      groupable: true,
      render: (item: AttributeOption) => item?.attribute?.name || 'N/A',
      width: 150,
    },
    {
      key: 'label',
      label: 'Label',
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: 'value',
      label: 'Value',
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      filterable: true,
      render: (item: AttributeOption) => (
        <span className={`px-2 py-1 rounded text-xs ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
      width: 100,
    },
    {
      key: 'sort_order',
      label: 'Sort Order',
      sortable: true,
      width: 100,
    }
  ];

  const tableConfig = {
    title: 'Product Attribute Options',
    description: 'Manage options for product attributes like size, color, etc.',
    searchPlaceholder: 'Search attribute options...',
    enableBulkActions: true,
    enableExport: true,
    enableColumnVisibility: true,
    enableDensity: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    columns: columnConfig,
    entityName: 'attribute option',
    entityNamePlural: 'attribute options',
  };

  return (
    <div className="p-6">
      <AdvancedGenericTable
        data={mockAttributeOptions}
        config={tableConfig}
        onItemEdit={(item: AttributeOption) => console.log('Edit attribute option:', item)}
        onItemDelete={(item: AttributeOption) => console.log('Delete attribute option:', item)}
        onBulkAction={(action: string, items: string[]) => console.log('Bulk action:', action, items)}
      />
    </div>
  );
}
