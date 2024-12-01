import React from 'react';
import { flexRender, type Table, type HeaderContext, type CellContext } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

interface DataTableProps<T> {
  table: Table<T>;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({ table, onRowClick }: DataTableProps<T>) {
  return (
    <div>
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const headerContext = header.getContext() as HeaderContext<T, unknown>;
                  const headerContent = flexRender(
                    header.column.columnDef.header,
                    headerContext
                  );
                  
                  return (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>{headerContent}</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr 
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext() as CellContext<T, unknown>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {table.getRowModel().rows.map(row => (
          <div
            key={row.id}
            onClick={() => onRowClick?.(row.original)}
            className="bg-white p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer space-y-2"
          >
            {row.getVisibleCells().map(cell => {
              const headerContent = flexRender(
                cell.column.columnDef.header,
                { column: cell.column } as HeaderContext<T, unknown>
              );
              const cellContent = flexRender(
                cell.column.columnDef.cell,
                cell.getContext() as CellContext<T, unknown>
              );
              
              return (
                <div key={cell.id} className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-500">{headerContent}:</span>
                  <span className="text-sm text-gray-900 text-right">{cellContent}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {table.getRowModel().rows.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No records found
        </div>
      )}
    </div>
  );
}