import React, { useState } from 'react';
import { useExport } from '../../hooks/useExport';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';

const ReportExportPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { exportReport, exporting } = useExport();
  const [exportType, setExportType] = useState<'individual' | 'assigner' | 'dmt'>('individual');

  const handleExport = async () => {
    try {
      await exportReport(exportType, user?.id);
    } catch (error) {
      showToast('Failed to export report', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Export Reports</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <Select
          label="Report Type"
          options={[
            { label: 'Individual Report', value: 'individual' },
            { label: 'Assigner Report', value: 'assigner' },
            { label: 'DMT Report', value: 'dmt' },
          ]}
          value={exportType}
          onChange={(e) => setExportType(e.target.value as any)}
        />

        <div className="pt-4">
          <Button onClick={handleExport} isLoading={exporting} className="w-full">
            Export as CSV
          </Button>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            The exported file will contain all data for the selected report type in CSV format.
            You can open it in Excel or any spreadsheet application.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportExportPage;

