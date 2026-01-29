import axiosInstance from './axiosInstance';
// import { Training } from '../types/training.types';

export interface TrainingSuggestion {
  trainingId: number;
  topic: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  ksaGap?: string;
}

export const suggestionApi = {
  getSuggestions: async (userId: number): Promise<TrainingSuggestion[]> => {
    // This would be implemented based on KSA gaps and appraisal data
    // For now, returning empty array as placeholder
    const response = await axiosInstance.get<TrainingSuggestion[]>(
      `/suggestions/${userId}`
    ).catch(() => {
      // If endpoint doesn't exist yet, return empty array
      return { data: [] };
    });
    return response.data;
  },

  getSuggestionsByKSA: async (positionId: number): Promise<TrainingSuggestion[]> => {
    const response = await axiosInstance.get<TrainingSuggestion[]>(
      `/suggestions/position/${positionId}`
    ).catch(() => {
      return { data: [] };
    });
    return response.data;
  },
};

