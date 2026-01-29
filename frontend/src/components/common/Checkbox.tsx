import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, description, className = '', ...props }) => {
  return (
    <label className={`flex items-start space-x-3 cursor-pointer ${className}`}>
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          {...props}
        />
      </div>
      <div className="text-sm">
        {label && <span className="font-medium text-gray-700">{label}</span>}
        {description && <p className="text-gray-500">{description}</p>}
      </div>
    </label>
  );
};

export default Checkbox;
