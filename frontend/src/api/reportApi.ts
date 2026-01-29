import axiosInstance from './axiosInstance';
import { 
  PaginatedIndividualReportsResponse,
  PaginatedAssignerReportsResponse,
  PaginatedDMTReportsResponse
} from '../types/report.types';

export const reportApi = {
  getIndividual: async (userId?: number, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedIndividualReportsResponse> => {
    const response = await axiosInstance.get<PaginatedIndividualReportsResponse>('/reports/individual', {
      params: { 
        userId,
        ...params
      },
    });
    return response.data;
  },

  getAssigner: async (assignerId?: number, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedAssignerReportsResponse> => {
    const response = await axiosInstance.get<PaginatedAssignerReportsResponse>('/reports/assigner', {
      params: { 
        assignerId,
        ...params
      },
    });
    return response.data;
  },

  getDMT: async (dmtId?: number, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedDMTReportsResponse> => {
    const response = await axiosInstance.get<PaginatedDMTReportsResponse>('/reports/dmt', {
      params: { 
        dmtId,
        ...params
      },
    });
    return response.data;
  },

  export: async (type: 'individual' | 'assigner' | 'dmt', id?: number): Promise<Blob> => {
    const response = await axiosInstance.get(`/reports/export`, {
      params: { type, id },
      responseType: 'blob',
    });
    return response.data;
  },
};

