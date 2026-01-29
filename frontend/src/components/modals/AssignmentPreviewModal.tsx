import React from 'react';
import { Modal } from '../common/Modal';
import { Assignment, AssignmentRecipient } from '../../types/assignment.types';
import { formatDate, formatTime } from '../../utils/formatDate';

interface AssignmentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  recipients: AssignmentRecipient[];
  isLoading?: boolean;
}

const AssignmentPreviewModal: React.FC<AssignmentPreviewModalProps> = ({
  isOpen,
  onClose,
  assignment,
  recipients,
  isLoading = false,
}) => {
  if (!assignment) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assignment Preview" size="lg">
      <div className="space-y-6">
        {/* Training Details */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Training Details</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Topic</p>
                <p className="text-sm text-gray-900">{assignment.topic || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date</p>
                <p className="text-sm text-gray-900">
                  {assignment.trainingStartDate ? formatDate(assignment.trainingStartDate) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Time</p>
                <p className="text-sm text-gray-900">
                  {assignment.trainingStartDate ? formatTime(assignment.trainingStartDate) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Venue</p>
                <p className="text-sm text-gray-900">{assignment.venue || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Trainer</p>
                <p className="text-sm text-gray-900">{assignment.trainer || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Assignee Type</p>
                <p className="text-sm text-gray-900 capitalize">{assignment.assigneeType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recipients */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Recipients ({recipients.length})
          </h3>
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading recipients...</p>
          ) : recipients.length === 0 ? (
            <p className="text-sm text-gray-500">No recipients found</p>
          ) : (
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recipients.map((recipient) => (
                    <tr key={recipient.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {recipient.firstName} {recipient.lastName}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">{recipient.email}</td>
                      <td className="px-4 py-2 text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            recipient.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : recipient.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {recipient.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {recipient.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignmentPreviewModal;

