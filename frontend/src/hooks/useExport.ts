import { useState } from 'react';
import { exportService } from '../services/exportService';
import { useToast } from '../context/ToastContext';

export const useExport = () => {
  const [exporting, setExporting] = useState(false);
  const { showToast } = useToast();

  const exportReport = async (
    type: 'individual' | 'assigner' | 'dmt',
    id?: number
  ): Promise<void> => {
    setExporting(true);
    try {
      await exportService.exportReport(type, id);
      showToast('Report exported successfully', 'success');
    } catch (error) {
      showToast('Failed to export report', 'error');
      throw error;
    } finally {
      setExporting(false);
    }
  };

  return {
    exportReport,
    exporting,
  };
};

