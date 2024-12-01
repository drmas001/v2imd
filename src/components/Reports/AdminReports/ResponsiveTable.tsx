import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TableRow {
  id: string | number;
  cells: {
    label: string;
    value: React.ReactNode;
  }[];
}

interface ResponsiveTableProps {
  headers: string[];
  rows: TableRow[];
  onSort?: (columnIndex: number) => void;
  sortColumn?: number;
  sortDirection?: 'asc' | 'desc';
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  headers,
  rows,
  onSort,
  sortColumn,
  sortDirection
}) => {
  const [expandedRow, setExpandedRow] = React.useState<string | number | null>(null);

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={header}
                  onClick={() => onSort?.(index)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    onSort ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{header}</span>
                    {onSort && sortColumn === index && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.cells.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cell.value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {rows.map((row) => (
          <div
            key={row.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  {/* Always show first two fields */}
                  {row.cells.slice(0, 2).map((cell, index) => (
                    <div key={index}>
                      <span className="text-xs text-gray-500">{cell.label}: </span>
                      <span className="text-sm font-medium text-gray-900">
                        {cell.value}
                      </span>
                    </div>
                  ))}
                </div>
                {expandedRow === row.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Expanded content */}
            {expandedRow === row.id && (
              <div className="px-4 pb-4 space-y-2">
                {row.cells.slice(2).map((cell, index) => (
                  <div key={index}>
                    <span className="text-xs text-gray-500">{cell.label}: </span>
                    <span className="text-sm text-gray-900">{cell.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No data available
        </div>
      )}
    </div>
  );
};

export default ResponsiveTable;