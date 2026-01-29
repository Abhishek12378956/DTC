import React, { useEffect, useState, useRef } from 'react';
import { reportApi } from '../../api/reportApi';
import { IndividualReport, PaginatedIndividualReportsResponse } from '../../types/report.types';
import { Loader } from '../../components/common/Loader';
import { Button } from '../../components/common/Button';
import { useExport } from '../../hooks/useExport';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatDate';
import { useToast } from '../../context/ToastContext';
import DataTable, { Column } from '../../components/tables/DataTable';
import Pagination from '../../components/common/Pagination';

import { assignmentRecipientApi } from '../../api/assignmentRecipientApi';

const IndividualReportPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { exportReport, exporting } = useExport();
  const [reports, setReports] = useState<IndividualReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const loadingRef = useRef(false);

  useEffect(() => {
    if (loadingRef.current) return;
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit]);

  const loadReports = async () => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      setLoading(true);
      const data: PaginatedIndividualReportsResponse = await reportApi.getIndividual(user?.id, {
        page: currentPage,
        limit: limit,
      });
      setReports(data.reports);
      setPagination({
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
        hasNext: data.pagination.hasNext,
        hasPrev: data.pagination.hasPrev,
      });
    } catch (error) {
      showToast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      await assignmentRecipientApi.updateOwnStatus(id, status);
      showToast('Status updated successfully', 'success');
      loadReports();
    } catch (error) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExport = async () => {
    try {
      await exportReport('individual', user?.id);
    } catch (error) {
      showToast('Failed to export report', 'error');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  const columns: Column<IndividualReport>[] = [
    { key: 'topic', header: 'Topic' },
    {
      key: 'trainingStartDate',
      header: 'Start Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'trainingEndDate',
      header: 'End Date',
      render: (value) => formatDate(value),
    },
    { key: 'venue', header: 'Venue' },
    { key: 'trainer', header: 'Trainer' },
    {
      key: 'status',
      header: 'Status',
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value === 'completed'
                ? 'bg-green-100 text-green-800'
                : value === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
          >
            {value}
          </span>
          {/* Allow user to update status if it's pending or completed */}
          <select
            value={value}
            onChange={(e) => handleStatusUpdate(row.id, e.target.value)}
            className="ml-2 text-xs border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
            disabled={updatingId === row.id}
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      ),
    },
    { key: 'notes', header: 'Notes' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Individual Reports</h1>
        <Button onClick={handleExport} isLoading={exporting}>
          Export CSV
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <Loader />
        ) : (
          <>
            <DataTable columns={columns} data={reports} emptyMessage="No reports found" />
            
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              hasNext={pagination.hasNext}
              hasPrev={pagination.hasPrev}
              total={pagination.total}
              limit={limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default IndividualReportPage;

