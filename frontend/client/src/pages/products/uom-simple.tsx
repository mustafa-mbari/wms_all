import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AdvancedGenericTable } from '../../components/tables/advanced-generic-table-fixed';

// Mock data for development
const mockUnitsOfMeasure = [
  {
    id: 1,
    name: 'Piece',
    symbol: 'pcs',
    type: 'count',
    description: 'Individual items or pieces',
    is_active: true,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: 'Kilogram',
    symbol: 'kg',
    type: 'weight',
    description: 'Weight measurement in kilograms',
    is_active: true,
    created_at: '2024-01-16T14:20:00Z',
    updated_at: '2024-01-16T14:20:00Z'
  },
  {
    id: 3,
    name: 'Liter',
    symbol: 'L',
    type: 'volume',
    description: 'Volume measurement in liters',
    is_active: true,
    created_at: '2024-01-17T09:15:00Z',
    updated_at: '2024-01-17T09:15:00Z'
  },
  {
    id: 4,
    name: 'Meter',
    symbol: 'm',
    type: 'length',
    description: 'Length measurement in meters',
    is_active: false,
    created_at: '2024-01-18T11:45:00Z',
    updated_at: '2024-01-18T11:45:00Z'
  }
];

type UnitOfMeasure = typeof mockUnitsOfMeasure[0];

export default function UnitsOfMeasurePage() {
  const columnConfig = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      filterable: true,
      groupable: true,
      width: 150,
    },
    {
      key: 'symbol',
      label: 'Symbol',
      sortable: true,
      filterable: true,
      width: 100,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      filterable: true,
      groupable: true,
      render: (item: UnitOfMeasure) => (
        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 capitalize">
          {item.type}
        </span>
      ),
      width: 120,
    },
    {
      key: 'description',
      label: 'Description',
      filterable: true,
      width: 200,
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      filterable: true,
      render: (item: UnitOfMeasure) => (
        <span className={`px-2 py-1 rounded text-xs ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
      width: 100,
    }
  ];

  const tableConfig = {
    title: 'Units of Measure',
    description: 'Manage units of measure for inventory and product specifications',
    searchPlaceholder: 'Search units of measure...',
    enableBulkActions: true,
    enableExport: true,
    enableColumnVisibility: true,
    enableDensity: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    columns: columnConfig,
    entityName: 'unit of measure',
    entityNamePlural: 'units of measure',
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <AdvancedGenericTable
          data={mockUnitsOfMeasure}
          config={tableConfig}
          onItemEdit={(item: UnitOfMeasure) => console.log('Edit unit of measure:', item)}
          onItemDelete={(item: UnitOfMeasure) => console.log('Delete unit of measure:', item)}
          onBulkAction={(action: string, items: string[]) => console.log('Bulk action:', action, items)}
        />
      </div>
    </DashboardLayout>
  );
}
