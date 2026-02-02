import React from 'react';
import DataTable, { Column } from './DataTable';
import { Training } from '../../types/training.types';
import { formatDate, formatTime } from '../../utils/formatDate';

interface TrainingsTableProps {
  trainings: Training[];
  onEdit?: (training: Training) => Promise<void>;
  onDelete?: (training: Training) => Promise<void>;
}

const TrainingsTable: React.FC<TrainingsTableProps> = ({ trainings, onEdit, onDelete }) => {
  // Debug: Log the training data to see what we're getting
  console.log('TrainingsTable received data:', trainings);
  
  const columns: Column<Training>[] = [
    {
      key: 'topic',
      header: 'Topic',
      mobileLabel: 'Topic'
    },
    {
      key: 'trainingStartDate',
      header: 'Start Date',
      mobileLabel: 'Start Date',
      render: (value) => value ? formatDate(value) : 'TBD',
    },
    {
      key: 'trainingEndDate',
      header: 'End Date',
      mobileLabel: 'End Date',
      render: (value) => value ? formatDate(value) : 'TBD',
    },
    {
      key: 'venue',
      header: 'Venue',
      mobileLabel: 'Venue',
      render: (value) => {
        if (typeof value === 'object' && value !== null) {
          // New structure: venue has name and locationName
          return `${value.locationName || 'TBD'} - ${value.name || 'TBD'}`;
        }
        return value || 'TBD';
      }
    },
    {
      key: 'trainer',
      header: 'Trainer',
      mobileLabel: 'Trainer',
      render: (value) => value?.name || 'TBD'
    },
    {
      key: 'status',
      header: 'Status',
      mobileLabel: 'Status',
      render: (value) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value === 'active'
              ? 'bg-green-100 text-green-800'
              : value === 'completed'
                ? 'bg-blue-100 text-blue-800'
                : value === 'cancelled'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
            }`}
        >
          {value || 'active'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      hideOnMobile: true,
      render: (_, training) => (
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(training);
              }}
              className="text-primary-600 hover:text-primary-900 text-sm font-medium"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(training);
              }}
              className="text-red-600 hover:text-red-900 text-sm font-medium"
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  // Custom mobile card render for better UX
  const renderMobileCard = (training: Training) => (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-gray-900 text-base mb-2">
          {training.topic}
        </h3>
        <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600 mb-2">
          <span className="flex items-center">
            📅 {training.trainingStartDate ? formatDate(training.trainingStartDate) : 'TBD'}
          </span>
          <span className="flex items-center">
            🕐 {training.trainingStartDate ? formatTime(training.trainingStartDate) : 'TBD'}
          </span>
          {training.trainingEndDate && (
            <span className="flex items-center">
              📅 {formatDate(training.trainingEndDate)}
            </span>
          )}
        </div>
        <div className="flex items-center">
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${training.status === 'active'
                ? 'bg-green-100 text-green-800'
                : training.status === 'completed'
                  ? 'bg-blue-100 text-blue-800'
                  : training.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
              }`}
          >
            {training.status || 'active'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
        <div>
          <span className="text-gray-600 block mb-1">Venue:</span>
          <p className="font-medium text-gray-900">
            {typeof training.venue === 'object' && training.venue !== null 
              ? `${training.venue.locationName || 'TBD'} - ${training.venue.name || 'TBD'}`
              : training.venue || 'TBD'
            }
          </p>
        </div>
        <div>
          <span className="text-gray-600 block mb-1">Trainer:</span>
          <p className="font-medium text-gray-900">{training.trainer?.name || 'TBD'}</p>
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="flex gap-2 pt-3 border-t">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(training);
              }}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors min-h-[44px] flex items-center justify-center"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(training);
              }}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors min-h-[44px] flex items-center justify-center"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={trainings}
      mobileCardRender={renderMobileCard}
    />
  );
};

export { TrainingsTable };
