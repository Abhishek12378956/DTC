import axiosInstance from './axiosInstance';
import { Venue, VenueCreateInput, VenueUpdateInput, PaginatedVenuesResponse, VenueOption } from '../types/venue.types';

export const venueApi = {
  // Get all venues with pagination
  getVenues: async (params?: {
    page?: number;
    limit?: number;
    includeInactive?: boolean;
  }): Promise<PaginatedVenuesResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.includeInactive) queryParams.append('includeInactive', 'true');

    const response = await axiosInstance.get<PaginatedVenuesResponse>(`/venues?${queryParams.toString()}`);
    return response.data;
  },

  // Get venue by ID
  getVenueById: async (id: number): Promise<Venue> => {
    const response = await axiosInstance.get<{ success: boolean; data: Venue }>(`/venues/${id}`);
    return response.data.data;
  },

  // Create new venue
  createVenue: async (venue: VenueCreateInput): Promise<Venue> => {
    const response = await axiosInstance.post<{ success: boolean; data: Venue }>('/venues', venue);
    return response.data.data;
  },

  // Update venue
  updateVenue: async (id: number, venue: VenueUpdateInput): Promise<void> => {
    await axiosInstance.put(`/venues/${id}`, venue);
  },

  // Delete/disable venue
  deleteVenue: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/venues/${id}`);
  },

  // Get active venues for dropdown
  getActiveVenues: async (): Promise<VenueOption[]> => {
    const response = await axiosInstance.get<VenueOption[]>('/venues/active');
    return response.data;
  }
};
