import { Response } from 'express';
import assignmentService from '../services/assignment.service';
import { AssignmentCreateInput, AssignmentRecipientUpdateInput } from '../models/assignment.model';
import { AuthRequest } from '../middleware/authMiddleware';

export class AssignmentController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const input: AssignmentCreateInput = {
        trainingId: req.body.trainingId,
        assigneeType: req.body.assigneeType,
        assigneeId: req.body.assigneeId,
        assignedBy: req.user!.id,
        notes: req.body.notes,
      };

      if (!input.trainingId || !input.assigneeType) {
        res.status(400).json({ error: 'trainingId and assigneeType are required' });
        return;
      }

      const result = await assignmentService.create(input);
      res.status(201).json({
        ...result,
        message: 'Training assigned successfully',
      });
    } catch (error: any) {
      console.error('Create assignment error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { 
        userId, 
        trainingId, 
        status, 
        page, 
        limit 
      } = req.query;
      
      const result = await assignmentService.findAll({
        userId: userId ? parseInt(userId as string) : undefined,
        trainingId: trainingId ? parseInt(trainingId as string) : undefined,
        status: status as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      
      res.json(result);
    } catch (error) {
      console.error('Get assignments error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getRecipients(req: AuthRequest, res: Response): Promise<void> {
    try {
      const assignmentId = parseInt(req.params.id);
      const recipients = await assignmentService.getRecipients(assignmentId);
      res.json(recipients);
    } catch (error) {
      console.error('Get assignment recipients error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateRecipientStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const input: AssignmentRecipientUpdateInput = {
        status: req.body.status,
        notes: req.body.notes,
      };

      if (!input.status || !['pending', 'completed', 'cancelled'].includes(input.status)) {
        res.status(400).json({ error: 'Valid status is required (pending, completed, cancelled)' });
        return;
      }

      // Check if user is the assigner
      const isAuthorized = await assignmentService.isUserAssigner(id, req.user!.id);
      if (!isAuthorized) {
        res.status(403).json({ error: 'Only the person who assigned the training can update recipient status' });
        return;
      }

      const recipient = await assignmentService.updateRecipientStatus(id, input);
      res.json(recipient);
    } catch (error: any) {
      if (error.message === 'No fields to update') {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Update assignment recipient status error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async updateOwnStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid recipient ID' });
        return;
      }

      if (!status || !['pending', 'completed'].includes(status)) {
        res.status(400).json({ error: 'Valid status is required (pending, completed)' });
        return;
      }

      // Check if user is the recipient
      const isAuthorized = await assignmentService.isUserRecipient(id, req.user!.id);

      if (!isAuthorized) {
        res.status(403).json({ error: 'You can only update your own training status' });
        return;
      }

      const recipient = await assignmentService.updateOwnStatus(id, status);
      res.json(recipient);
    } catch (error: any) {
      console.error('Update own status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new AssignmentController();

