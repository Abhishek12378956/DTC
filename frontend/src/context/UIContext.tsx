import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleSidebar = (): void => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <UIContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        setSidebarOpen,
        theme,
        setTheme,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
};

