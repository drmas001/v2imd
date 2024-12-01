import React from 'react';
import type { Table } from '@tanstack/react-table';
import TableHeader from './TableHeader';
import { DataTable } from './DataTable';

interface TableContainerProps<T> {
  table: Table<T>;
  title: string;
  count: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onRowClick?: (row: T) => void;
}

export function TableContainer<T>({
  table,
  title,
  count,
  searchValue,
  onSearchChange,
  onRowClick
}: TableContainerProps<T>) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <TableHeader
        title={title}
        count={count}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
      />
      <DataTable table={table} onRowClick={onRowClick} />
    </div>
  );
}