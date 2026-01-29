import axiosInstance from './axiosInstance';

export interface Department {
  id: number;
  name: string;
  description?: string;
}

export const departmentApi = {
  getAll: async (): Promise<Department[]> => {
    const response = await axiosInstance.get<Department[]>('/departments');
    return response.data;
  },
};