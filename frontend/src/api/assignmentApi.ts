import axiosInstance from './axiosInstance';
import {
  AssignmentCreateInput,
  AssignmentRecipient,
  PaginatedAssignmentsResponse,
} from '../types/assignment.types';

export const assignmentApi = {
  create: async (assignment: AssignmentCreateInput): Promise<{
    assignmentId: number;
    recipientsCount: number;
  }> => {
    
    const response = await axiosInstance.post('/assignments', assignment);
    return response.data;
  },

  getAll: async (params?: {
    userId?: number;
    trainingId?: number;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedAssignmentsResponse> => {
    const response = await axiosInstance.get<PaginatedAssignmentsResponse>('/assignments', { params });
    return response.data;
  },

  getRecipients: async (assignmentId: number): Promise<AssignmentRecipient[]> => {
    const response = await axiosInstance.get<AssignmentRecipient[]>(
      `/assignments/${assignmentId}/recipients`
    );
    return response.data;
  },
};

