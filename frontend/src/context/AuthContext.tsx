import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user.types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = authService.getStoredUser();
      if (storedUser && authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          authService.setStoredUser(currentUser);
        } catch {
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await authService.login({ email, password });
    setUser(response.user);
  };

  const logout = (): void => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = async (): Promise<void> => {
    if (authService.isAuthenticated()) {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        authService.setStoredUser(currentUser);
      } catch {
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

