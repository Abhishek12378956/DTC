export interface Venue {
  id?: number;
  name: string;
  description?: string;
  conferenceRoom?: string;
  is_active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VenueCreateInput {
  name: string;
  description?: string;
  conferenceRoom?: string;
  is_active?: boolean;
}

export interface VenueUpdateInput {
  name?: string;
  description?: string;
  conferenceRoom?: string;
  is_active?: boolean;
}

export interface PaginatedVenuesResponse {
  venues: Venue[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface VenueOption {
  value: number;
  label: string;
}
