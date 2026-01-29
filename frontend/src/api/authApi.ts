import axiosInstance from './axiosInstance';
import { LoginCredentials, AuthResponse, User } from '../types/user.types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // debugger
    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    // const response = await axios.post<AuthResponse>(
    //   'http://localhost:5000/api/auth/login',
    //   credentials,
    //   {
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     withCredentials: true,   // if you need cookies/session support
    //   }
    // );
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await axiosInstance.get<User>('/auth/me');  
      console.log("responseresponse", response);                   
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

