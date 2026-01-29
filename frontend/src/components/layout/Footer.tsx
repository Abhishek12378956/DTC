import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-gray-500 space-y-2 sm:space-y-0">
          <span>© {new Date().getFullYear()} Training Calendar Management System</span>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-primary-600">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary-600">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary-600">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
