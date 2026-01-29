import { authApi } from '../api/authApi';
import { storageService } from './storageService';
import { User, LoginCredentials, AuthResponse } from '../types/user.types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await authApi.login(credentials);
    storageService.setToken(response.token);
    storageService.setUser(response.user);
    return response;
  },

  logout: (): void => {
    authApi.logout();
    storageService.clear();
    console.log('Logged out');
  },

  getCurrentUser: async (): Promise<User> => {
    return await authApi.getCurrentUser();
  },

  getStoredUser: (): User | null => {
    return storageService.getUser();
  },

  setStoredUser: (user: User): void => {
    storageService.setUser(user);
  },

  getToken: (): string | null => {
    return storageService.getToken();
  },

  isAuthenticated: (): boolean => {
    return !!storageService.getToken();
  },
};

