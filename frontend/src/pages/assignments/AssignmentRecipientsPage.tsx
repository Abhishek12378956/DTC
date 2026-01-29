import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assignmentApi } from '../../api/assignmentApi';
import { assignmentRecipientApi } from '../../api/assignmentRecipientApi';
import { AssignmentRecipient } from '../../types/assignment.types';
import { Loader } from '../../components/common/Loader';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

const AssignmentRecipientsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [recipients, setRecipients] = useState<AssignmentRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      loadRecipients();
    }
  }, [id]);

  const loadRecipients = async () => {
    try {
      setLoading(true);
      const data = await assignmentApi.getRecipients(parseInt(id!));
      setRecipients(data);
    } catch (error) {
      showToast('Failed to load recipients', 'error');
      navigate('/assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (recipientId: number, status: string) => {
    setUpdatingId(recipientId);
    try {
      await assignmentRecipientApi.updateStatus(recipientId, {
        status: status as any,
      });
      showToast('Status updated successfully', 'success');
      loadRecipients();
    } catch (error) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };


  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Assignment Recipients</h1>
        <Button variant="outline" onClick={() => navigate('/assignments')}>
          Back
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recipients.map((recipient) => (
              <tr key={recipient.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {recipient.firstName} {recipient.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{recipient.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {recipient.notes || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    <select
                      value={recipient.status}
                      onChange={(e) => handleStatusUpdate(recipient.id!, e.target.value)}
                      className="w-32 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500"
                      disabled={updatingId === recipient.id}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignmentRecipientsPage;

