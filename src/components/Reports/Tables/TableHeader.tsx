import React from 'react';
import { Search } from 'lucide-react';

interface TableHeaderProps {
  title: string;
  count: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  title,
  count,
  searchValue,
  onSearchChange
}) => {
  return (
    <div className="p-4 md:p-6 border-b border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{count} records</p>
        </div>
        <div className="w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableHeader;