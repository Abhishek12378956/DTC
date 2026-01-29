import React from 'react';

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type="date"
        className={`block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default DatePicker;
