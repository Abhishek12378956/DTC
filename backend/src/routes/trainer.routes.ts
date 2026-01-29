import { Request, Response } from 'express';
import { TrainerController } from '../controllers/trainer.controller';

export class TrainerRoutes {
  static registerRoutes(app: any): void {
    // Get active trainers for dropdown (must come before :id route)
    app.get('/api/trainers/active', TrainerController.getActiveTrainers);
    
    // Get all trainers with pagination and filtering
    app.get('/api/trainers', TrainerController.getTrainers);
    
    // Get trainer by ID
    app.get('/api/trainers/:id', TrainerController.getTrainerById);
    
    // Create new trainer
    app.post('/api/trainers', TrainerController.createTrainer);
    
    // Update trainer
    app.put('/api/trainers/:id', TrainerController.updateTrainer);
    
    // Delete/disable trainer
    app.delete('/api/trainers/:id', TrainerController.deleteTrainer);
  }
}
