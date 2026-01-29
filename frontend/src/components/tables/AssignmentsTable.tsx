import React from 'react';
import DataTable, { Column } from './DataTable';
import { Assignment } from '../../types/assignment.types';
import { formatDate } from '../../utils/formatDate';

interface AssignmentsTableProps {
  assignments: Assignment[];
  onViewRecipients?: (assignment: Assignment) => void;
}

const AssignmentsTable: React.FC<AssignmentsTableProps> = ({ assignments, onViewRecipients }) => {
  const columns: Column<Assignment>[] = [
    {
      key: 'topic',
      header: 'Training Topic',
      mobileLabel: 'Topic'
    },
    {
      key: 'trainingStartDate',
      header: 'Training Date',
      mobileLabel: 'Date',
      render: (value) => value ? formatDate(value) : 'TBD',
    },
    {
      key: 'assigneeType',
      header: 'Assignee Type',
      mobileLabel: 'Type'
    },
    {
      key: 'recipientCount',
      header: 'Recipients',
      mobileLabel: 'Recipients',
      render: (value) => value || 0,
    },
    {
      key: 'assignedByName',
      header: 'Assigned By',
      mobileLabel: 'Assigned By'
    },
    {
      key: 'createdAt',
      header: 'Assigned On',
      mobileLabel: 'Assigned On',
      render: (value) => value ? formatDate(value) : '-',
    },
    {
      key: 'actions',
      header: 'Actions',
      hideOnMobile: true,
      render: (_, assignment) => (
        <div className="flex space-x-2">
          {onViewRecipients && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewRecipients(assignment);
              }}
              className="text-primary-600 hover:text-primary-900 text-sm font-medium"
            >
              View Recipients
            </button>
          )}
        </div>
      ),
    },
  ];

  // Custom mobile card render for better UX
  const renderMobileCard = (assignment: Assignment) => (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-gray-900 text-base mb-2">
          {assignment.topic}
        </h3>
        <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600 mb-2">
          <span className="flex items-center">
            📅 {assignment.trainingStartDate ? formatDate(assignment.trainingStartDate) : 'TBD'}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
            {assignment.assigneeType}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
        <div>
          <span className="text-gray-600 block mb-1">Recipients:</span>
          <p className="font-semibold text-gray-900 text-lg">{assignment.recipientCount || 0}</p>
        </div>
        <div>
          <span className="text-gray-600 block mb-1">Assigned By:</span>
          <p className="font-medium text-gray-900">{assignment.assignedByName || '-'}</p>
        </div>
      </div>

      <div className="text-xs text-gray-500 pt-2 border-t">
        Assigned on: {assignment.createdAt ? formatDate(assignment.createdAt) : '-'}
      </div>

      {onViewRecipients && (
        <div className="pt-3 border-t">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewRecipients(assignment);
            }}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors min-h-[44px] flex items-center justify-center"
          >
            View Recipients
          </button>
        </div>
      )}
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={assignments}
      mobileCardRender={renderMobileCard}
    />
  );
};

export { AssignmentsTable };
