import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationService, Toast } from '../services/notificationService';

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((newToasts) => {
      setToasts(newToasts);
    });
    return unsubscribe;
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void => {
    notificationService.show(message, type);
  };

  const removeToast = (id: string): void => {
    notificationService.remove(id);
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

