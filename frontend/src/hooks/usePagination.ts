import { useState, useMemo } from 'react';

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
}

export const usePagination = (options: UsePaginationOptions = {}) => {
  const { initialPage = 1, initialPageSize = 10, totalItems = 0 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);

  const goToPage = (page: number): void => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const nextPage = (): void => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = (): void => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToFirstPage = (): void => {
    setCurrentPage(1);
  };

  const goToLastPage = (): void => {
    setCurrentPage(totalPages);
  };

  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize, totalItems);
  }, [startIndex, pageSize, totalItems]);

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    setCurrentPage,
    setPageSize,
    goToPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
  };
};

