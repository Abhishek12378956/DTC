export interface Category {
  id?: number;
  name: string;
  description?: string;
  is_active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryCreateInput {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface CategoryUpdateInput {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface PaginatedCategoriesResponse {
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CategoryOption {
  value: number;
  label: string;
}
