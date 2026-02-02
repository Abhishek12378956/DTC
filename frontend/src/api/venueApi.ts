import axiosInstance from './axiosInstance';
import { Venue, Location, VenueCreateInput, VenueUpdateInput, LocationCreateInput, LocationUpdateInput, PaginatedVenuesResponse, PaginatedLocationsResponse, LocationOption, VenueOption } from '../types/venue.types';

export const venueApi = {
  // Location methods
  getLocations: async (params?: {
    page?: number;
    limit?: number;
    includeInactive?: boolean;
  }): Promise<PaginatedLocationsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.includeInactive) queryParams.append('includeInactive', 'true');

    const response = await axiosInstance.get<PaginatedLocationsResponse>(`/locations?${queryParams.toString()}`);
    return response.data;
  },

  getActiveLocations: async (): Promise<LocationOption[]> => {
    const response = await axiosInstance.get<LocationOption[]>('/locations/active');
    return response.data;
  },

  createLocation: async (location: LocationCreateInput): Promise<Location> => {
    const response = await axiosInstance.post<{ success: boolean; data: Location }>('/locations', location);
    return response.data.data;
  },

  updateLocation: async (id: number, location: LocationUpdateInput): Promise<void> => {
    await axiosInstance.put(`/locations/${id}`, location);
  },

  deleteLocation: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/locations/${id}`);
  },

  // Venue methods (conference rooms)
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

  getVenueById: async (id: number): Promise<Venue> => {
    const response = await axiosInstance.get<{ success: boolean; data: Venue }>(`/venues/${id}`);
    return response.data.data;
  },

  createVenue: async (venue: VenueCreateInput): Promise<Venue> => {
    const response = await axiosInstance.post<{ success: boolean; data: Venue }>('/venues', venue);
    return response.data.data;
  },

  updateVenue: async (id: number, venue: VenueUpdateInput): Promise<void> => {
    await axiosInstance.put(`/venues/${id}`, venue);
  },

  deleteVenue: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/venues/${id}`);
  },

  getActiveVenues: async (): Promise<VenueOption[]> => {
    const response = await axiosInstance.get<VenueOption[]>('/venues/active');
    return response.data;
  },

  getVenuesByLocation: async (locationId: number): Promise<VenueOption[]> => {
    const response = await axiosInstance.get<VenueOption[]>(`/venues/by-location/${locationId}`);
    return response.data;
  }
};
