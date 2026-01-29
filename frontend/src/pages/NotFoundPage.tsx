import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-700">Page Not Found</h2>
        <p className="mt-2 text-gray-500">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

