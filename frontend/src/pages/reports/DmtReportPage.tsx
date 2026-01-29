import React, { useEffect, useState, useRef } from 'react';
import { reportApi } from '../../api/reportApi';
import { DMTReport, PaginatedDMTReportsResponse } from '../../types/report.types';
import { Loader } from '../../components/common/Loader';
import { Button } from '../../components/common/Button';
import { useExport } from '../../hooks/useExport';
import { useToast } from '../../context/ToastContext';
import DataTable, { Column } from '../../components/tables/DataTable';
import { formatDate } from '../../utils/formatDate';
import Pagination from '../../components/common/Pagination';

const DmtReportPage: React.FC = () => {
  const { showToast } = useToast();
  const { exportReport, exporting } = useExport();
  const [reports, setReports] = useState<DMTReport[]>([]);
  const [loading, setLoading] = useState(true);
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
      const data: PaginatedDMTReportsResponse = await reportApi.getDMT(undefined, {
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

  const handleExport = async () => {
    try {
      await exportReport('dmt');
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

  const columns: Column<DMTReport>[] = [
    { key: 'dmtName', header: 'DMT' },
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
    { key: 'totalMembers', header: 'Total Members' },
    {
      key: 'completedCount',
      header: 'Completed',
      render: (value) => <span className="text-green-600">{value}</span>,
    },
    {
      key: 'pendingCount',
      header: 'Pending',
      render: (value) => <span className="text-yellow-600">{value}</span>,
    },
    { key: 'presentCount', header: 'Present' },
    { key: 'absentCount', header: 'Absent' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">DMT Reports</h1>
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

export default DmtReportPage;

