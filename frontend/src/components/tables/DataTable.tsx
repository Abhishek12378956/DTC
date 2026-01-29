import React from 'react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  mobileLabel?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  mobileCardRender?: (row: T, index: number) => React.ReactNode;
  onRowClick?: (row: T) => void;
}

function DataTable<T>({
  columns,
  data,
  emptyMessage = 'No records found',
  mobileCardRender,
  onRowClick
}: DataTableProps<T>) {

  // Mobile Card View
  const renderMobileCards = () => (
    <div className="block lg:hidden space-y-4">
      {!data || data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        data.map((row, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            onClick={() => onRowClick?.(row)}
          >
            {mobileCardRender ? (
              mobileCardRender(row, index)
            ) : (
              // Default card layout if no custom render provided
              <div className="space-y-2">
                {columns
                  .filter(col => !col.hideOnMobile)
                  .map((column) => {
                    const value = (row as any)[column.key];
                    return (
                      <div key={column.key as string} className="flex justify-between items-start gap-4">
                        <span className="text-sm font-medium text-gray-600 min-w-[100px]">
                          {column.mobileLabel || column.header}:
                        </span>
                        <span className="text-sm text-gray-900 text-right flex-1">
                          {column.render ? column.render(value, row) : value ?? '-'}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  // Desktop Table View
  const renderDesktopTable = () => (
    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key as string}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              >
                {columns.map((column) => {
                  const value = (row as any)[column.key];
                  return (
                    <td
                      key={column.key as string}
                      className={`px-6 py-4 text-sm text-gray-700 ${column.className || ''}`}
                    >
                      {column.render ? column.render(value, row) : value ?? '-'}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      {renderMobileCards()}
      {renderDesktopTable()}
    </>
  );
}

export default DataTable;
