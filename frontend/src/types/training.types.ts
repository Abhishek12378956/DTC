export interface Training {
  id?: number;
  topic: string;
  description?: string;
  venueId?: number;
  trainingStartDate?: Date | string;
  trainingEndDate?: Date | string;
  trainerId?: number;
  duration?: number;
  categoryId?: number;
  status?: string;
  createdBy?: number;
  createdByName?: string;
  // Nested trainer object
  trainer?: {
    id: number;
    name: string;
    type: string;
  };
  // Nested category object
  category?: {
    id: number;
    name: string;
    description?: string;
    is_active: boolean;
  };
  // Nested venue object
  venue?: {
    id: number;
    name: string;
    description?: string;
    locationId?: number;
    locationName?: string;
    is_active: boolean;
  };
}

export interface TrainingCreateInput {
  topic: string;
  description?: string;
  venueId?: number;
  trainingStartDate?: string;
  trainingEndDate?: string;
  trainerId: number;
  duration?: number;
  categoryId?: number;
  createdBy: number;
}

export interface TrainingUpdateInput {
  topic?: string;
  description?: string;
  venueId?: number;
  trainingStartDate?: string;
  trainingEndDate?: string;
  trainerId?: number;
  duration?: number;
  categoryId?: number;
  status?: string;
}

export interface PaginatedTrainingsResponse {
  data: Training[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

