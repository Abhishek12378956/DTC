import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { useToast } from './context/ToastContext';

const App: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <AppRoutes />
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-md shadow-lg max-w-sm ${
              toast.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : toast.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : toast.type === 'warning'
                ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default App;
