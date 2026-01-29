import axiosInstance from './axiosInstance';
import { Trainer, TrainerCreateInput, TrainerUpdateInput, PaginatedTrainersResponse, TrainerOption } from '../types/trainer.types';

export const trainerApi = {
  // Get all trainers with pagination
  getTrainers: async (params?: {
    page?: number;
    limit?: number;
    includeInactive?: boolean;
  }): Promise<PaginatedTrainersResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.includeInactive) queryParams.append('includeInactive', 'true');

    const response = await axiosInstance.get<PaginatedTrainersResponse>(`/trainers?${queryParams.toString()}`);
    return response.data;
  },

  // Get trainer by ID
  getTrainerById: async (id: number): Promise<Trainer> => {
    const response = await axiosInstance.get<{ success: boolean; data: Trainer }>(`/trainers/${id}`);
    return response.data.data;
  },

  // Create new trainer
  createTrainer: async (trainer: TrainerCreateInput): Promise<Trainer> => {
    const response = await axiosInstance.post<{ success: boolean; data: Trainer }>('/trainers', trainer);
    return response.data.data;
  },

  // Update trainer
  updateTrainer: async (id: number, trainer: TrainerUpdateInput): Promise<void> => {
    await axiosInstance.put(`/trainers/${id}`, trainer);
  },

  // Delete/disable trainer
  deleteTrainer: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/trainers/${id}`);
  },

  // Get active trainers for dropdown
  getActiveTrainers: async (): Promise<TrainerOption[]> => {
    const response = await axiosInstance.get<TrainerOption[]>('/trainers/active');
    return response.data;
  }
};
