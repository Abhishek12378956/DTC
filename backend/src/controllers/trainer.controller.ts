import { Request, Response } from 'express';
import trainerService from '../services/trainer.service';
import { Trainer, TrainerCreateInput, TrainerUpdateInput, PaginatedTrainersResponse } from '../models/trainer.model';

export class TrainerController {
  // Get all trainers (active only by default)
  static async getTrainers(req: Request, res: Response): Promise<void> {
    try {
      const { includeInactive, page, limit } = req.query;
      
      const result = await trainerService.findAll({
        includeInactive: includeInactive === 'true',
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json(result);
    } catch (error) {
      console.error('Error fetching trainers:', error);
      res.status(500).json({ message: 'Failed to fetch trainers' });
    }
  }

  // Get trainer by ID
  static async getTrainerById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const trainer = await trainerService.findById(parseInt(id));

      if (!trainer) {
        res.status(404).json({ message: 'Trainer not found' });
        return;
      }

      res.json(trainer);
    } catch (error) {
      console.error('Error fetching trainer:', error);
      res.status(500).json({ message: 'Failed to fetch trainer' });
    }
  }

  // Create new trainer
  static async createTrainer(req: Request, res: Response): Promise<void> {
    try {
      const { 
        trainerName, 
        trainerType, 
        profession, 
        company, 
        location, 
        qualification, 
        purpose, 
        categoryId, 
        is_active = true 
      }: TrainerCreateInput = req.body;

      if (!trainerName || trainerName.trim() === '') {
        res.status(400).json({ message: 'Trainer name is required' });
        return;
      }

      if (!trainerType || !['internal', 'external'].includes(trainerType)) {
        res.status(400).json({ message: 'Valid trainer type (internal/external) is required' });
        return;
      }

      const newTrainer = await trainerService.create({ 
        trainerName, 
        trainerType, 
        profession, 
        company, 
        location, 
        qualification, 
        purpose, 
        categoryId, 
        is_active 
      });

      res.status(201).json({
        ...newTrainer,
        message: 'Trainer created successfully'
      });
    } catch (error: any) {
      console.error('Error creating trainer:', error);
      res.status(500).json({ message: error.message || 'Failed to create trainer' });
    }
  }

  // Update trainer
  static async updateTrainer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { 
        trainerName, 
        trainerType, 
        profession, 
        company, 
        location, 
        qualification, 
        purpose, 
        categoryId, 
        is_active 
      }: TrainerUpdateInput = req.body;

      if (trainerType && !['internal', 'external'].includes(trainerType)) {
        res.status(400).json({ message: 'Valid trainer type (internal/external) is required' });
        return;
      }

      await trainerService.update(parseInt(id), { 
        trainerName, 
        trainerType, 
        profession, 
        company, 
        location, 
        qualification, 
        purpose, 
        categoryId, 
        is_active 
      });

      res.json({
        message: 'Trainer updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating trainer:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
      } else if (error.message.includes('already exists')) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message || 'Failed to update trainer' });
      }
    }
  }

  // Delete trainer (soft delete by setting is_active = false)
  static async deleteTrainer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await trainerService.delete(parseInt(id));

      res.json({ message: 'Trainer disabled successfully' });
    } catch (error: any) {
      console.error('Error deleting trainer:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
      } else if (error.message.includes('Cannot delete')) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message || 'Failed to delete trainer' });
      }
    }
  }

  // Get active trainers for dropdown
  static async getActiveTrainers(req: Request, res: Response): Promise<void> {
    try {
      const trainers = await trainerService.getActiveTrainers();
      res.json(trainers);
    } catch (error) {
      console.error('Error fetching active trainers:', error);
      res.status(500).json({ message: 'Failed to fetch active trainers' });
    }
  }
}
