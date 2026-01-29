import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { assignmentApi } from '../../api/assignmentApi';
import { trainingApi } from '../../api/trainingApi';
import { masterApi } from '../../api/masterApi';
import { userApi } from '../../api/userApi';
import { AssignmentCreateInput } from '../../types/assignment.types';
import { Training, PaginatedTrainingsResponse } from '../../types/training.types';
import { User, PaginatedUsersResponse } from '../../types/user.types';
import { Position, DMT } from '../../types/ksa.types';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import TextArea from '../../components/common/TextArea';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import { ASSIGNEE_TYPES } from '../../utils/constants';

const AssignmentCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState<AssignmentCreateInput>({
    trainingId: 0,
    assigneeType: 'individual',
    assigneeId: '',
    isMandatory: false,
    notes: ''
  });
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [dmtList, setDmtList] = useState<DMT[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [formData.assigneeType]);

  // Debounced search function
  const debouncedSearch = useCallback(
    (searchTerm: string) => {
      if (searchTerm.trim() === '') {
        setFilteredUsers(users);
      } else {
        const filtered = users.filter(user =>
          `${user.firstName} ${user.lastName} ${user.staffId}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
      }
    },
    [users]
  );

  // Debounce effect for user search
  useEffect(() => {
    if (formData.assigneeType === 'individual') {
      const timer = setTimeout(() => {
        debouncedSearch(userSearchTerm);
      }, 300); // 300ms debounce delay

      return () => clearTimeout(timer);
    }
  }, [userSearchTerm, formData.assigneeType, debouncedSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [trainingsData, usersData, dmtData, positionsData] = await Promise.all([
        trainingApi.getAll(),
        userApi.getAll(),
        masterApi.getDMT(),
        masterApi.getPositions(),
      ]);
      const trainingsResponse: PaginatedTrainingsResponse = trainingsData as PaginatedTrainingsResponse;
      setTrainings(trainingsResponse.data);
      const usersResponse: PaginatedUsersResponse = usersData as PaginatedUsersResponse;
      setUsers(usersResponse.users);
      setDmtList(dmtData);
      setPositions(positionsData);
    } catch (error) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  const getAssigneeOptions = () => {
    switch (formData.assigneeType) {
      case 'individual':
        return filteredUsers.map((user) => ({
          label: `${user.firstName} ${user.lastName} (${user.staffId})`,
          value: user.id!.toString(),
        }));
      case 'grade':
      case 'level':
        const values = new Set<string>();
        users.forEach((user) => {
          const val = formData.assigneeType === 'grade' ? user.grade : user.level;
          if (val) values.add(val);
        });
        return Array.from(values).map((val) => ({ label: val, value: val }));
      case 'position':
        return positions.map((pos) => ({
          label: pos.title,
          value: pos.id!.toString(),
        }));
      case 'dmt':
        return dmtList.map((dmt) => ({
          label: dmt.name,
          value: dmt.id!.toString(),
        }));
      case 'function':
        const functions = new Set<string>();
        users.forEach((user) => {
          if (user.function) functions.add(user.function);
        });
        return Array.from(functions).map((func) => ({ label: func, value: func }));
      default:
        return [];
    }
  };

  const handleUserSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setUserSearchTerm(searchTerm);
    setShowUserDropdown(true);
  };

  const handleUserSelect = (user: User) => {
    const isSelected = selectedUsers.some(selectedUser => selectedUser.id === user.id);
    if (isSelected) {
      // Remove user from selection
      setSelectedUsers(selectedUsers.filter(selectedUser => selectedUser.id !== user.id));
    } else {
      // Add user to selection
      setSelectedUsers([...selectedUsers, user]);
    }
    setUserSearchTerm('');
    setShowUserDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For individual assignments with multiple users, create separate assignments for each user
      if (formData.assigneeType === 'individual' && selectedUsers.length > 0) {
        const assignmentPromises = selectedUsers.map(user =>
          assignmentApi.create({
            ...formData,
            assigneeId: user.id!.toString()
          })
        );
        await Promise.all(assignmentPromises);
      } else {
        await assignmentApi.create(formData);
      }
      showToast('Training assigned successfully', 'success');
      navigate('/assignments');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to create assignment', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <Loader fullScreen />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Assign Training</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <Select
          label="Training *"
          options={[
            { label: 'Select a training', value: '0' },
            ...trainings.map((t) => ({ label: t.topic, value: t.id!.toString() })),
          ]}
          value={formData.trainingId.toString()}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, trainingId: parseInt(e.target.value) })}
          required
        />

        <Select
          label="Assignee Type *"
          options={[
            { label: 'Individual', value: ASSIGNEE_TYPES.INDIVIDUAL },
            { label: 'Grade', value: ASSIGNEE_TYPES.GRADE },
            { label: 'Level', value: ASSIGNEE_TYPES.LEVEL },
            { label: 'Position', value: ASSIGNEE_TYPES.POSITION },
            { label: 'DMT', value: ASSIGNEE_TYPES.DMT },
            { label: 'Function', value: ASSIGNEE_TYPES.FUNCTION },
          ]}
          value={formData.assigneeType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFormData({
              ...formData,
              assigneeType: e.target.value as 'individual' | 'grade' | 'level' | 'position' | 'dmt' | 'function',
              assigneeId: '',
            })
          }
          required
        />

        <div className={formData.assigneeType === 'individual' ? '' : 'hidden'}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User *
          </label>
          <div className="relative" ref={dropdownRef}>
            {/* Tag-based multi-select input */}
            <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md min-h-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 relative">
              {selectedUsers.map((user) => (
                <span
                  key={user.id}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {user.firstName} {user.lastName}
                  <button
                    type="button"
                    onClick={() => handleUserSelect(user)}
                    className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={userSearchTerm}
                onChange={handleUserSearch}
                onFocus={() => setShowUserDropdown(true)}
                placeholder="Search and add users..."
                className="flex-1 min-w-[100px] border-0 outline-none bg-transparent text-sm"
                style={{ flexShrink: 1, flexGrow: 1 }}
              />
            </div>

            {showUserDropdown && formData.assigneeType === 'individual' && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className={`px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center justify-between ${selectedUsers.some(selectedUser => selectedUser.id === user.id) ? 'bg-blue-50' : ''
                        }`}
                    >
                      <div>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.staffId} • {user.email}
                        </div>
                      </div>
                      {selectedUsers.some(selectedUser => selectedUser.id === user.id) && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500">
                    No users found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={formData.assigneeType === 'individual' ? 'hidden' : ''}>
          <Select
            name="assigneeId"
            label={
              formData.assigneeType === 'grade'
                ? 'Grade *'
                : formData.assigneeType === 'level'
                  ? 'Level *'
                  : formData.assigneeType === 'position'
                    ? 'Position *'
                    : formData.assigneeType === 'dmt'
                      ? 'DMT *'
                      : formData.assigneeType === 'function'
                        ? 'Function *'
                        : 'User *'
            }
            options={[
              { label: 'Select...', value: '' },
              ...getAssigneeOptions(),
            ]}
            value={formData.assigneeId || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, assigneeId: e.target.value })}
            required={formData.assigneeType !== 'individual'}
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isMandatory"
            checked={formData.isMandatory || false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, isMandatory: e.target.checked })
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isMandatory" className="text-sm font-medium text-gray-700">
            Mandatory
          </label>
        </div>

        <TextArea
          label="Notes"
          value={formData.notes || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/assignments')}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Assign Training
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AssignmentCreatePage;

