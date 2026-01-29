export interface Trainer {
  id?: number;
  trainerName: string;
  trainerType: 'internal' | 'external';
  profession?: string;
  company?: string;
  location?: string;
  qualification?: string;
  purpose?: string;
  categoryId?: number;
  categoryName?: string;
  is_active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TrainerCreateInput {
  trainerName: string;
  trainerType: 'internal' | 'external';
  profession?: string;
  company?: string;
  location?: string;
  qualification?: string;
  purpose?: string;
  categoryId?: number;
  is_active?: boolean;
}

export interface TrainerUpdateInput {
  trainerName?: string;
  trainerType?: 'internal' | 'external';
  profession?: string;
  company?: string;
  location?: string;
  qualification?: string;
  purpose?: string;
  categoryId?: number;
  is_active?: boolean;
}

export interface PaginatedTrainersResponse {
  trainers: Trainer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
