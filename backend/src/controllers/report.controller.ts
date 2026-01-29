import { Response } from 'express';
import reportService from '../services/report.service';
import { AuthRequest } from '../middleware/authMiddleware';

export class ReportController {
  async getIndividual(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : req.user!.id;
      const { page, limit } = req.query;
      
      const result = await reportService.getIndividualReport(userId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      
      res.json(result);
    } catch (error) {
      console.error('Get individual report error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAssigner(req: AuthRequest, res: Response): Promise<void> {
    try {
      const assignerId = req.query.assignerId ? parseInt(req.query.assignerId as string) : req.user!.id;
      const { page, limit } = req.query;
      
      const result = await reportService.getAssignerReport(assignerId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      
      res.json(result);
    } catch (error) {
      console.error('Get assigner report error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getDMT(req: AuthRequest, res: Response): Promise<void> {
    try {
      const dmtId = req.query.dmtId ? parseInt(req.query.dmtId as string) : undefined;
      const { page, limit } = req.query;
      
      const result = await reportService.getDMTReport(dmtId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      
      res.json(result);
    } catch (error) {
      console.error('Get DMT report error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async export(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { type, id } = req.query;

      if (!type || !['individual', 'assigner', 'dmt'].includes(type as string)) {
        res.status(400).json({ error: 'Invalid export type. Use: individual, assigner, or dmt' });
        return;
      }

      const exportId = id ? parseInt(id as string) : req.user!.id;
      const data = await reportService.exportReport(type as 'individual' | 'assigner' | 'dmt', exportId);

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="training-report-${type}-${Date.now()}.csv"`);

      // Convert to CSV
      if (data.length > 0) {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map((row: any) =>
          Object.values(row).map((val: any) => `"${val || ''}"`).join(',')
        );
        res.send([headers, ...rows].join('\n'));
      } else {
        res.send('No data available');
      }
    } catch (error: any) {
      console.error('Export report error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}

export default new ReportController();

