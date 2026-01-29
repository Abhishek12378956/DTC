import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  total,
  limit,
  onPageChange,
  onLimitChange,
}) => {
  const handlePrevious = () => {
    if (hasPrev) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value);
    if (onLimitChange) {
      onLimitChange(newLimit);
    }
  };

  // Generate page numbers to show
  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 bg-white px-4 py-3 border-t border-gray-200 mt-4">
      {/* Results info and limit selector */}
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{total}</span> results
        </div>
        
        {onLimitChange && (
          <div className="flex items-center space-x-2">
            <label htmlFor="limit-select" className="text-sm text-gray-700">
              Show:
            </label>
            <select
              id="limit-select"
              value={limit}
              onChange={handleLimitChange}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={!hasPrev}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            hasPrev
              ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={!hasNext}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            hasNext
              ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
