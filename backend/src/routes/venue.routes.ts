import { Request, Response } from 'express';
import { VenueController } from '../controllers/venue.controller';

export class VenueRoutes {
  static registerRoutes(app: any): void {
    // Get active venues for dropdown (must come before :id route)
    app.get('/api/venues/active', VenueController.getActiveVenues);
    
    // Get all venues with pagination and filtering
    app.get('/api/venues', VenueController.getVenues);
    
    // Get venue by ID
    app.get('/api/venues/:id', VenueController.getVenueById);
    
    // Create new venue
    app.post('/api/venues', VenueController.createVenue);
    
    // Update venue
    app.put('/api/venues/:id', VenueController.updateVenue);
    
    // Delete/disable venue
    app.delete('/api/venues/:id', VenueController.deleteVenue);
  }
}
