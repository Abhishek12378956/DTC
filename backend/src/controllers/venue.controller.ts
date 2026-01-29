import { Request, Response } from 'express';
import venueService from '../services/venue.service';
import { Venue, VenueCreateInput, VenueUpdateInput, PaginatedVenuesResponse } from '../models/venue.model';

export class VenueController {
  // Get all venues (active only by default)
  static async getVenues(req: Request, res: Response): Promise<void> {
    try {
      const { includeInactive, page, limit } = req.query;
      
      const result = await venueService.findAll({
        includeInactive: includeInactive === 'true',
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json(result);
    } catch (error) {
      console.error('Error fetching venues:', error);
      res.status(500).json({ message: 'Failed to fetch venues' });
    }
  }

  // Get venue by ID
  static async getVenueById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const venue = await venueService.findById(parseInt(id));

      if (!venue) {
        res.status(404).json({ message: 'Venue not found' });
        return;
      }

      res.json(venue);
    } catch (error) {
      console.error('Error fetching venue:', error);
      res.status(500).json({ message: 'Failed to fetch venue' });
    }
  }

  // Create new venue
  static async createVenue(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, conferenceRoom, is_active = true }: VenueCreateInput = req.body;

      if (!name || name.trim() === '') {
        res.status(400).json({ message: 'Venue name is required' });
        return;
      }

      const newVenue = await venueService.create({ name, description, conferenceRoom, is_active });

      res.status(201).json({
        ...newVenue,
        message: 'Venue created successfully'
      });
    } catch (error: any) {
      console.error('Error creating venue:', error);
      res.status(500).json({ message: error.message || 'Failed to create venue' });
    }
  }

  // Update venue
  static async updateVenue(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, conferenceRoom, is_active }: VenueUpdateInput = req.body;

      await venueService.update(parseInt(id), { name, description, conferenceRoom, is_active });

      res.json({
        message: 'Venue updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating venue:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
      } else if (error.message.includes('already exists')) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message || 'Failed to update venue' });
      }
    }
  }

  // Delete venue (soft delete by setting is_active = false)
  static async deleteVenue(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await venueService.delete(parseInt(id));

      res.json({ message: 'Venue disabled successfully' });
    } catch (error: any) {
      console.error('Error deleting venue:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
      } else if (error.message.includes('Cannot delete')) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message || 'Failed to delete venue' });
      }
    }
  }

  // Get active venues for dropdown
  static async getActiveVenues(req: Request, res: Response): Promise<void> {
    try {
      const venues = await venueService.getActiveVenues();
      res.json(venues);
    } catch (error) {
      console.error('Error fetching active venues:', error);
      res.status(500).json({ message: 'Failed to fetch active venues' });
    }
  }
}
