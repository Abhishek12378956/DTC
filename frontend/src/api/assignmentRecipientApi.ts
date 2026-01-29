import axiosInstance from './axiosInstance';
import {
  AssignmentRecipient,
  AssignmentRecipientUpdateInput,
} from '../types/assignment.types';

export const assignmentRecipientApi = {
  updateStatus: async (
    id: number,
    input: AssignmentRecipientUpdateInput
  ): Promise<AssignmentRecipient> => {
    const response = await axiosInstance.put(`/assignment-recipients/${id}/status`, input);
    return response.data;
  },

  updateOwnStatus: async (
    id: number,
    status: string
  ): Promise<AssignmentRecipient> => {
    const response = await axiosInstance.put(`/assignment-recipients/${id}/self-update`, {
      status,
    });
    return response.data;
  },
};

