import axiosInstance from './axiosInstance';
import { User, UserCreateInput, UserUpdateInput, PaginatedUsersResponse } from '../types/user.types';

export const userApi = {
  getAll: async (params?: {
    search?: string;
    roleId?: number;
    dmtId?: number;
    department?: string;
    function?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedUsersResponse> => {
    const response = await axiosInstance.get<PaginatedUsersResponse>('/users', { params });
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await axiosInstance.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (user: UserCreateInput): Promise<User> => {
    const response = await axiosInstance.post<User>('/users', user);
    return response.data;
  },

  update: async (id: number, user: UserUpdateInput): Promise<User> => {
    const response = await axiosInstance.put<User>(`/users/${id}`, user);
    return response.data;
  },
  delete: async (id: number): Promise<User> => {
  const response = await axiosInstance.delete<User>(`/users/${id}`);
  return response.data;
},
};

