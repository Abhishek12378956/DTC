import React from 'react';

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, description, children }) => {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-5 py-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      <div className="p-5">
        <div className="h-64">{children}</div>
      </div>
    </div>
  );
};

export default ChartCard;
