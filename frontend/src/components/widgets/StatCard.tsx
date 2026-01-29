import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  footer?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, footer }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          {icon && <div className="flex-shrink-0 text-primary-600">{icon}</div>}
          <div className="flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">{value}</dd>
            {change && <p className="mt-2 text-sm text-green-600">{change}</p>}
          </div>
        </div>
      </div>
      {footer && <div className="px-5 py-3 bg-gray-50 text-sm text-gray-500">{footer}</div>}
    </div>
  );
};

export default StatCard;
