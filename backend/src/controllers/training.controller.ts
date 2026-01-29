import { Response } from 'express';
import trainingService from '../services/training.service';
import { TrainingCreateInput, TrainingUpdateInput } from '../models/training.model';
import { AuthRequest } from '../middleware/authMiddleware';

export class TrainingController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { 
        search, 
        status, 
        category, 
        page, 
        limit 
      } = req.query;
      
      const result = await trainingService.findAll({
        search: search as string,
        status: status as string,
        category: category as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      
      // Transform response to desired format
      const response = {
        success: true,
        data: result.trainings,
        pagination: result.pagination
      };
      
      res.json(response);
    } catch (error) {
      console.error('Get trainings error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const training = await trainingService.findById(id);

      if (!training) {
        res.status(404).json({ error: 'Training not found' });
        return;
      }

      // Transform response to desired format
      const response = {
        success: true,
        data: training
      };

      res.json(response);
    } catch (error) {
      console.error('Get training error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const input: TrainingCreateInput = {
        topic: req.body.topic,
        description: req.body.description,
        venueId: req.body.venueId,
        trainingStartDate: req.body.trainingStartDate,
        trainingEndDate: req.body.trainingEndDate,
        trainerId: req.body.trainerId,
        duration: req.body.duration,
        categoryId: req.body.categoryId,
        createdBy: req.user!.id,
      };

      if (!input.topic) {
        res.status(400).json({ error: 'Topic is required' });
        return;
      }

      if (!input.trainerId || input.trainerId === 0) {
        res.status(400).json({ error: 'Trainer is required' });
        return;
      }

      const training = await trainingService.create(input);
      res.status(201).json(training);
    } catch (error) {
      console.error('Create training error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const input: TrainingUpdateInput = req.body;

      const training = await trainingService.update(id, input);
      res.json(training);
    } catch (error: any) {
      if (error.message === 'No fields to update') {
        res.status(400).json({ error: error.message });
      } else if (error.message === 'Training not found after update') {
        res.status(404).json({ error: 'Training not found' });
      } else {
        console.error('Update training error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await trainingService.delete(id);
      res.json({ message: 'Training deleted successfully' });
    } catch (error) {
      console.error('Delete training error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new TrainingController();

