import axiosInstance from './axiosInstance';
import { Category, CategoryCreateInput, CategoryUpdateInput, PaginatedCategoriesResponse, CategoryOption } from '../types/category.types';

export const categoryApi = {
  // Get all categories with pagination
  getCategories: async (params?: {
    page?: number;
    limit?: number;
    includeInactive?: boolean;
  }): Promise<PaginatedCategoriesResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.includeInactive) queryParams.append('includeInactive', 'true');

    const response = await axiosInstance.get<PaginatedCategoriesResponse>(`/categories?${queryParams.toString()}`);
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (id: number): Promise<Category> => {
    const response = await axiosInstance.get<{ success: boolean; data: Category }>(`/categories/${id}`);
    return response.data.data;
  },

  // Create new category
  createCategory: async (category: CategoryCreateInput): Promise<Category> => {
    const response = await axiosInstance.post<{ success: boolean; data: Category }>('/categories', category);
    return response.data.data;
  },

  // Update category
  updateCategory: async (id: number, category: CategoryUpdateInput): Promise<void> => {
    await axiosInstance.put(`/categories/${id}`, category);
  },

  // Delete/disable category
  deleteCategory: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/categories/${id}`);
  },

  // Get active categories for dropdown
  getActiveCategories: async (): Promise<CategoryOption[]> => {
    const response = await axiosInstance.get<CategoryOption[]>('/categories/active');
    return response.data;
  }
};
