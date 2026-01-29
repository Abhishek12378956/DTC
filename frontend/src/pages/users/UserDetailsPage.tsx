import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import { User } from '../../types/user.types';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';

const UserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await userApi.getById(parseInt(id, 10));
        setUser(data);
      } catch (error) {
        showToast('Failed to load user details', 'error');
        navigate('/users');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id, navigate, showToast]);

  const handleEdit = () => {
    if (user) {
      navigate(`/users/edit/${user.id}`);
    }
  };

  if (loading || !user) {
    return <Loader />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Details</h1>
        <div className="flex space-x-2">
          <Button onClick={() => navigate('/users')} variant="outline">
            Back to Users
          </Button>
          <Button onClick={handleEdit}>
            Edit User
          </Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium text-gray-500">Basic Information</h2>
              <dl className="mt-2 space-y-2">
                <div className="flex">
                  <dt className="w-32 text-sm font-medium text-gray-500">Staff ID</dt>
                  <dd className="text-sm text-gray-900">{user.staffId}</dd>
                </div>
                <div className="flex">
                  <dt className="w-32 text-sm font-medium text-gray-500">Employee ID</dt>
                  <dd className="text-sm text-gray-900">{user.employeeId || '-'}</dd>
                </div>
                <div className="flex">
                  <dt className="w-32 text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900">{`${user.firstName} ${user.lastName || ''}`.trim()}</dd>
                </div>
                <div className="flex">
                  <dt className="w-32 text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{user.email}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-500">Contact Information</h2>
             
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium text-gray-500">Employment Details</h2>
              <dl className="mt-2 space-y-2">
                <div className="flex">
                  <dt className="w-32 text-sm font-medium text-gray-500">Department</dt>
                  <dd className="text-sm text-gray-900">{user.department || '-'}</dd>
                </div>

                <div className="flex">
                  <dt className="w-32 text-sm font-medium text-gray-500">Role</dt>
                  <dd className="text-sm text-gray-900">{user.roleName || '-'}</dd>
                </div>
                <div className="flex">
                  <dt className="w-32 text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status || 'inactive'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
