import axiosInstance from './axiosInstance';
import { Training, TrainingCreateInput, TrainingUpdateInput, PaginatedTrainingsResponse } from '../types/training.types';

export const trainingApi = {
  getAll: async (params?: {
    search?: string;
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedTrainingsResponse> => {
    const response = await axiosInstance.get<PaginatedTrainingsResponse>('/trainings', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Training> => {
    const response = await axiosInstance.get<{ success: boolean; data: Training }>(`/trainings/${id}`);
    return response.data.data;
  },

  create: async (training: TrainingCreateInput): Promise<Training> => {
    const response = await axiosInstance.post<Training>('/trainings', training);
    return response.data;
  },

  update: async (id: number, training: TrainingUpdateInput): Promise<Training> => {
    const response = await axiosInstance.put<Training>(`/trainings/${id}`, training);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/trainings/${id}`);
  },
};

