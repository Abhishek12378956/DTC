export interface Location {
  id?: number;
  name: string;
  description?: string;
  is_active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Venue {
  id?: number;
  name: string; // Conference room name
  locationId: number;
  locationName?: string; // For display purposes
  description?: string;
  is_active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LocationCreateInput {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface LocationUpdateInput {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface VenueCreateInput {
  name: string; // Conference room name
  locationId: number;
  description?: string;
  is_active?: boolean;
}

export interface VenueUpdateInput {
  name?: string;
  locationId?: number;
  description?: string;
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

export interface PaginatedLocationsResponse {
  locations: Location[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface LocationOption {
  value: number;
  label: string;
}

export interface VenueOption {
  value: number;
  label: string;
  locationId: number;
}
