import React from 'react';
import { Outlet } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

export const AppLayout: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useUI();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onToggleSidebar={toggleSidebar} />
      <div className="flex flex-1">
        {/* Backdrop overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}
        <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

