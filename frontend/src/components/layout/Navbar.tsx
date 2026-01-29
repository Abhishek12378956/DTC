import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
              >
                <span className="sr-only">Toggle sidebar</span>
                ☰
              </button>
            )}
            <div className="flex items-center space-x-2">
              <img
                src="https://www.itcpspd.com/images/itc-logo.svg"
                alt="ITC Logo"
                className="h-6 sm:h-8 w-auto"
              />
              <span className="hidden sm:inline text-lg font-semibold text-gray-700">|</span>
              <Link to="/" className="text-base sm:text-xl font-bold text-primary-600 whitespace-nowrap">
                Training Calendar
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="hidden sm:inline text-sm text-gray-700">
              {user?.firstName} {user?.lastName} ({user?.roleName})
            </span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap"
            >
              {user?.firstName ? 'Logout' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
