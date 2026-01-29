// frontend/src/pages/users/UserCreatePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import { departmentApi } from '../../api/departmentApi';
import { masterApi } from '../../api/masterApi';
import { validatePassword } from '../../utils/passwordUtils';
import { UserCreateInput, User, PaginatedUsersResponse } from '../../types/user.types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import { Department } from '../../api/departmentApi';
import { Role, DMT, Position } from '../../types/ksa.types';
import { generateRandomPassword } from '../../utils/passwordUtils';

const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [dmts, setDmts] = useState<DMT[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  // Generate initial random password
  const generatePassword = useCallback(() => generateRandomPassword(8), []);

  const [formData, setFormData] = useState<Omit<UserCreateInput, 'roleId'> & { roleId: number | undefined }>({
    staffId: '',
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    password: generatePassword(),
    roleId: undefined,  // We'll set this to a number when roles are loaded
    department: '',
    level: '',
    dmtId: 0,
    function: '',
    grade: '',
    positionId: 0,
    managerId: 0,
    status: 'active'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [employeeIdError, setEmployeeIdError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch departments and roles on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [departmentsData, rolesData, dmtsData, positionsData, usersData] = await Promise.all([
          departmentApi.getAll(),
          masterApi.getRoles(),
          masterApi.getDMT(),
          masterApi.getPositions(),
          userApi.getAll()
        ]);
        setDepartments(departmentsData);
        setRoles(rolesData);
        setDmts(dmtsData);
        setPositions(positionsData);
        const usersResponse: PaginatedUsersResponse = usersData as PaginatedUsersResponse;
        setManagers(usersResponse.users);

        // Set default role if available
        if (rolesData.length > 0) {
          setFormData(prev => ({
            ...prev,
            roleId: rolesData[0].id
          }));
        } else {
          // If no roles are available, we need to handle this case
          // You might want to show an error or disable the form
          showToast('No roles available. Please contact an administrator.', 'error');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Failed to load required data', 'error');
      }
    };

    fetchData();
  }, [showToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Clear previous error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));

    // Clear employee ID error when user types in the employee ID field
    if (name === 'employeeId' && employeeIdError) {
      setEmployeeIdError(null);
    }

    // Validate text fields to prevent special characters
    if (name === 'firstName' || name === 'lastName') {
      // Allow only letters and spaces for names
      const nameRegex = /^[a-zA-Z\s]*$/;
      if (!nameRegex.test(value)) {
        setErrors(prev => ({ 
          ...prev, 
          [name]: 'Special characters and numbers are not allowed. Only letters and spaces are permitted.' 
        }));
        return;
      }
    }

    if (name === 'staffId' || name === 'employeeId') {
      // Allow only letters, numbers, and no special characters for IDs
      const idRegex = /^[a-zA-Z0-9]*$/;
      if (!idRegex.test(value)) {
        setErrors(prev => ({ 
          ...prev, 
          [name]: 'Special characters are not allowed. Only letters and numbers are permitted.' 
        }));
        return;
      }
    }

    if (name === 'level' || name === 'grade' || name === 'function') {
      // Allow only letters, numbers, and spaces for these fields
      const textRegex = /^[a-zA-Z0-9\s]*$/;
      if (!textRegex.test(value)) {
        setErrors(prev => ({ 
          ...prev, 
          [name]: 'Special characters are not allowed. Only letters, numbers, and spaces are permitted.' 
        }));
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // Clear email error first
    setEmailError(null);

    // Validate email domain on blur
    if (value) {
      const allowedDomains = ['itc.in', 'associatemail.in'];
      const emailDomain = value.split('@')[1];
      
      if (!emailDomain || !allowedDomains.includes(emailDomain)) {
        setEmailError('Email must be from itc.in or associatemail.in domain');
      }
    }
  };

  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Clear error for this field first
    setErrors(prev => ({ ...prev, [name]: '' }));

    // Re-validate name fields on blur
    if (name === 'firstName' || name === 'lastName') {
      const nameRegex = /^[a-zA-Z\s]*$/;
      if (value && !nameRegex.test(value)) {
        setErrors(prev => ({ 
          ...prev, 
          [name]: 'Special characters and numbers are not allowed. Only letters and spaces are permitted.' 
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.roleId === undefined) {
      showToast('Please select a role', 'error');
      return;
    }

    // Validate email domain before submission
    if (formData.email) {
      const allowedDomains = ['itc.in', 'associatemail.in'];
      const emailDomain = formData.email.split('@')[1];
      
      if (!emailDomain || !allowedDomains.includes(emailDomain)) {
        setEmailError('Email must be from itc.in or associatemail.in domain');
        return;
      }
    }

    // Clear email error if validation passes
    if (emailError) {
      setEmailError(null);
    }

    // Validate password meets requirements
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      showToast(passwordValidation.message || 'Invalid password', 'error');
      return;
    }

    // Validate all text fields
    const nameRegex = /^[a-zA-Z\s]*$/;
    const idRegex = /^[a-zA-Z0-9]*$/;
    const textRegex = /^[a-zA-Z0-9\s]*$/;

    // Validate names
    if (formData.firstName && !nameRegex.test(formData.firstName)) {
      setErrors(prev => ({ 
        ...prev, 
        firstName: 'Special characters and numbers are not allowed. Only letters and spaces are permitted.' 
      }));
      showToast('Please fix validation errors before submitting', 'error');
      return;
    }
    if (formData.lastName && !nameRegex.test(formData.lastName)) {
      setErrors(prev => ({ 
        ...prev, 
        lastName: 'Special characters and numbers are not allowed. Only letters and spaces are permitted.' 
      }));
      showToast('Please fix validation errors before submitting', 'error');
      return;
    }

    // Validate IDs
    if (formData.staffId && !idRegex.test(formData.staffId)) {
      setErrors(prev => ({ 
        ...prev, 
        staffId: 'Special characters are not allowed. Only letters and numbers are permitted.' 
      }));
      showToast('Please fix validation errors before submitting', 'error');
      return;
    }
    if (formData.employeeId && !idRegex.test(formData.employeeId)) {
      setErrors(prev => ({ 
        ...prev, 
        employeeId: 'Special characters are not allowed. Only letters and numbers are permitted.' 
      }));
      showToast('Please fix validation errors before submitting', 'error');
      return;
    }

    // Validate other text fields
    if (formData.level && !textRegex.test(formData.level)) {
      setErrors(prev => ({ 
        ...prev, 
        level: 'Special characters are not allowed. Only letters, numbers, and spaces are permitted.' 
      }));
      showToast('Please fix validation errors before submitting', 'error');
      return;
    }
    if (formData.grade && !textRegex.test(formData.grade)) {
      setErrors(prev => ({ 
        ...prev, 
        grade: 'Special characters are not allowed. Only letters, numbers, and spaces are permitted.' 
      }));
      showToast('Please fix validation errors before submitting', 'error');
      return;
    }
    if (formData.function && !textRegex.test(formData.function)) {
      setErrors(prev => ({ 
        ...prev, 
        function: 'Special characters are not allowed. Only letters, numbers, and spaces are permitted.' 
      }));
      showToast('Please fix validation errors before submitting', 'error');
      return;
    }

    // Create a properly typed submission object
    const submissionData: UserCreateInput = {
      ...formData,
      roleId: formData.roleId,
      // dmtId: formData.roleId, // REMOVED: Incorrect logic linking dmtId to roleId
    };

    setLoading(true);
    try {
      await userApi.create(submissionData);
      showToast('User created successfully', 'success');
      navigate('/master/users');
    } catch (error: any) {
      console.error('Error creating user:', error);

      // Check if the error is about duplicate employee ID
      if (error.response?.data?.error?.includes('Employee ID already exists')) {
        setEmployeeIdError('This Employee ID is already registered');
      } else {
        showToast(error.response?.data?.error || 'Failed to create user', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New User</h1>
        <Button
          onClick={() => navigate('/master/users')}
          variant="outline"
        >
          Back to Users
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Staff ID"
            name="staffId"
            value={formData.staffId}
            onChange={handleChange}
            required
            error={errors.staffId}
          />
          <div>
            <Input
              label="Employee ID"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              error={errors.employeeId || employeeIdError || undefined}
            />
          </div>
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={handleNameBlur}
            required
            error={errors.firstName}
          />
          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            onBlur={handleNameBlur}
            required
            error={errors.lastName}
          />
          <div>
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleEmailBlur}
              error={errors.email || emailError || undefined}
              required
            />
          </div>
          <div className="relative">
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              className="pr-10"
              error={errors.password}
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 8 characters long and include uppercase, lowercase, number, and special character
            </p>
          </div>
          <Select
            label="Role"
            name="roleId"
            value={formData.roleId?.toString() || ''}
            onChange={(e) => {
              const roleId = parseInt(e.target.value, 10);
              setFormData(prev => ({
                ...prev,
                roleId: isNaN(roleId) ? undefined : roleId,
              }));
            }}
            options={[
              { value: '', label: 'Select a role', disabled: true },
              ...roles.map(role => ({
                value: role.id?.toString() || '',
                label: role.name
              }))
            ]}
            required
          />
          <Select
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select a department' },
              ...departments.map(dept => ({
                value: dept.name, // Using name as backend expects string
                label: dept.name
              }))
            ]}
          />
          <Select
            label="DMT"
            name="dmtId"
            value={formData.dmtId?.toString() || ''}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setFormData(prev => ({ ...prev, dmtId: isNaN(val) ? undefined : val }));
            }}
            options={[
              { value: '', label: 'Select a DMT' },
              ...dmts.map(d => ({
                value: d.id?.toString() || '',
                label: d.name
              }))
            ]}
          />
          <Select
            label="Position"
            name="positionId"
            value={formData.positionId?.toString() || ''}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setFormData(prev => ({ ...prev, positionId: isNaN(val) ? undefined : val }));
            }}
            options={[
              { value: '', label: 'Select a Position' },
              ...positions.map(p => ({
                value: p.id?.toString() || '',
                label: p.title
              }))
            ]}
          />
          <Select
            label="Manager"
            name="managerId"
            value={formData.managerId?.toString() || ''}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setFormData(prev => ({ ...prev, managerId: isNaN(val) ? undefined : val }));
            }}
            options={[
              { value: '', label: 'Select a Manager' },
              ...managers.map(u => ({
                value: u.id?.toString() || '',
                label: `${u.firstName} ${u.lastName || ''} (${u.staffId})`
              }))
            ]}
          />
          <Input
            label="Level"
            name="level"
            value={formData.level}
            onChange={handleChange}
            error={errors.level}
          />
          <Input
            label="Grade"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            error={errors.grade}
          />
          <Input
            label="Function"
            name="function"
            value={formData.function}
            onChange={handleChange}
            error={errors.function}
          />
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/master/users')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserCreatePage;