import React from 'react';
import DataTable, { Column } from './DataTable';
import { User } from '../../types/user.types';

interface UsersTableProps {
  users: User[];
  onEdit?: (user: User) => void;
  onDelete?: (User: User) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({ users, onEdit, onDelete }) => {
  const columns: Column<User>[] = [
    {
      key: 'staffId',
      header: 'Staff ID',
      mobileLabel: 'Staff ID'
    },
    {
      key: 'firstName',
      header: 'Name',
      mobileLabel: 'Name',
      render: (_, user) => `${user.firstName} ${user.lastName || ''}`.trim(),
    },
    {
      key: 'email',
      header: 'Email',
      mobileLabel: 'Email'
    },
    {
      key: 'department',
      header: 'Department',
      mobileLabel: 'Department',
      hideOnMobile: true
    },
    {
      key: 'function',
      header: 'Function',
      mobileLabel: 'Function',
      hideOnMobile: true
    },
    {
      key: 'level',
      header: 'Level',
      mobileLabel: 'Level',
      hideOnMobile: true
    },
    {
      key: 'grade',
      header: 'Grade',
      mobileLabel: 'Grade',
      hideOnMobile: true
    },
    {
      key: 'roleName',
      header: 'Role',
      mobileLabel: 'Role'
    },
    {
      key: 'status',
      header: 'Status',
      mobileLabel: 'Status',
      render: (value) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value === 'active'
              ? 'bg-green-100 text-green-800'
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
      render: (_, user) => (
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(user);
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
                onDelete(user);
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
  const renderMobileCard = (user: User) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-base mb-1">
            {user.firstName} {user.lastName || ''}
          </h3>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
            }`}
        >
          {user.status || 'active'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
        <div>
          <span className="text-gray-600 block mb-1">Staff ID:</span>
          <p className="font-medium text-gray-900">{user.staffId || '-'}</p>
        </div>
        <div>
          <span className="text-gray-600 block mb-1">Role:</span>
          <p className="font-medium text-gray-900">{user.roleName || '-'}</p>
        </div>
        <div>
          <span className="text-gray-600 block mb-1">Department:</span>
          <p className="font-medium text-gray-900">{user.department || '-'}</p>
        </div>
        <div>
          <span className="text-gray-600 block mb-1">Function:</span>
          <p className="font-medium text-gray-900">{user.function || '-'}</p>
        </div>
        <div>
          <span className="text-gray-600 block mb-1">Level:</span>
          <p className="font-medium text-gray-900">{user.level || '-'}</p>
        </div>
        <div>
          <span className="text-gray-600 block mb-1">Grade:</span>
          <p className="font-medium text-gray-900">{user.grade || '-'}</p>
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="flex gap-2 pt-3 border-t">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(user);
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
                onDelete(user);
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
      data={users}
      mobileCardRender={renderMobileCard}
    />
  );
};

