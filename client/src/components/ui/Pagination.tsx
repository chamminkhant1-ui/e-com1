import React from 'react';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  limitOptions?: number[];
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 25, 50, 100],
}) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(total, page * limit);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-gray-200 sm:px-6 pagination">
      {/* Total records summary */}
      <div className="text-sm text-gray-500">
        စုစုပေါင်း <span className="font-semibold text-gray-900">{total}</span> ခုအနက်{' '}
        <span className="font-semibold text-gray-900">{from}</span> မှ{' '}
        <span className="font-semibold text-gray-900">{to}</span> အထိ ဖော်ပြနေသည်
      </div>

      <div className="flex items-center gap-6">
        {/* Limit Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">တန်းအရေအတွက်:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="block text-sm text-gray-700 bg-white border border-gray-300 rounded-md py-1 px-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {limitOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Page Buttons */}
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="relative inline-flex items-center px-3 py-1.5 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <span className="sr-only">Previous</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="hidden sm:inline-flex">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pNum = idx + 1;
              const isCurrent = pNum === page;
              return (
                <button
                  key={pNum}
                  onClick={() => onPageChange(pNum)}
                  className={`relative inline-flex items-center px-3.5 py-1.5 border text-sm font-medium focus:z-10 focus:outline-none ${
                    isCurrent
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pNum}
                </button>
              );
            })}
          </div>

          {/* Simple version for mobile/compact views */}
          <span className="inline-flex sm:hidden items-center px-4 py-1.5 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700 select-none">
            {page} / {totalPages}
          </span>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="relative inline-flex items-center px-3 py-1.5 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <span className="sr-only">Next</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
