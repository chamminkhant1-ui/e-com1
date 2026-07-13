import React from 'react';
import { Pagination } from './Pagination';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  page?: number;
  limit?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  onSort?: (key: string, order: 'ASC' | 'DESC') => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  loading = false,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
  emptyMessage = 'ပြသရန် ဒေတာမရှိသေးပါ။',
}: DataTableProps<T>) {
  const handleSortClick = (key: string, sortable?: boolean) => {
    if (!sortable || !onSort) return;
    const newOrder = sortBy === key && sortOrder === 'ASC' ? 'DESC' : 'ASC';
    onSort(key, newOrder);
  };

  const showPagination =
    page !== undefined &&
    limit !== undefined &&
    total !== undefined &&
    onPageChange &&
    onLimitChange;

  return (
    <div className="table-container border border-gray-200">
      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-gray-200 text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSortClick(col.key, col.sortable)}
                  className={`px-6 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase select-none ${
                    col.sortable ? 'cursor-pointer hover:bg-gray-100 hover:text-gray-900' : ''
                  } ${col.className || ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && onSort && (
                      <span className="inline-block text-gray-400">
                        {sortBy === col.key ? (
                          sortOrder === 'ASC' ? (
                            <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 4l-8 8h16l-8-8z" />
                            </svg>
                          ) : (
                            <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 20l8-8H4l8 8z" />
                            </svg>
                          )
                        ) : (
                          <svg className="h-3.5 w-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <span className="text-sm text-gray-500 font-medium">ဒေတာများကို ဆွဲယူနေပါသည်...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={row.id ?? rIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-gray-50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 text-sm text-gray-700 font-normal whitespace-nowrap ${col.className || ''}`}
                    >
                      {col.render ? col.render(row, rIdx) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && !loading && total > 0 && (
        <Pagination
          page={page!}
          limit={limit!}
          total={total!}
          onPageChange={onPageChange!}
          onLimitChange={onLimitChange!}
        />
      )}
    </div>
  );
}
