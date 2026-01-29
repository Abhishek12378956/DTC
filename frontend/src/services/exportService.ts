import { reportApi } from '../api/reportApi';
import { downloadFile } from '../utils/downloadFile';

export const exportService = {
  exportReport: async (
    type: 'individual' | 'assigner' | 'dmt',
    id?: number
  ): Promise<void> => {
    try {
      const blob = await reportApi.export(type, id);
      const filename = `training-report-${type}-${Date.now()}.csv`;
      downloadFile(blob, filename);
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  },
};

