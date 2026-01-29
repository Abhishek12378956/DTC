import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import { departmentApi } from '../../api/departmentApi';
import { masterApi } from '../../api/masterApi';
import { UserUpdateInput } from '../../types/user.types';
import { Department } from '../../api/departmentApi';
import { Role } from '../../types/ksa.types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';

const UserEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<UserUpdateInput, 'roleId'> & { roleId: number | undefined }>({
    staffId: '',
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    roleId: 1,
    department: '',
    level: '',
    password: '',
    dmtId: 1,
    function: '',
    status: 'active'
  });

  // Fetch user data, departments, and roles
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [user, departmentsData, rolesData] = await Promise.all([
          userApi.getById(parseInt(id, 10)),
          departmentApi.getAll(),
          masterApi.getRoles()
        ]);
        
        setDepartments(departmentsData);
        setRoles(rolesData);
        
        setFormData({
          staffId: user.staffId,
          employeeId: user.employeeId || '',
          firstName: user.firstName,
          lastName: user.lastName || '',
          email: user.email,
          roleId: user.roleId,
          department: user.department || '',
          level: user.level || '',
          password: user.password || '',
          dmtId: user.dmtId || 1,
          function: user.function || '',
          status: user.status || 'active'
        });
      } catch (error) {
        showToast('Failed to load user', 'error');
        navigate('/users');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, showToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear previous error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
    
    // Clear email error when user types in the email field
    if (name === 'email' && emailError) {
      setEmailError(null);
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

    if (name === 'level' || name === 'function') {
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
      [name]: name === 'roleId' ? parseInt(value, 10) : value
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

  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Clear error for this field first
    setErrors(prev => ({ ...prev, [name]: '' }));

    // Re-validate ID fields on blur
    if (name === 'staffId' || name === 'employeeId') {
      const idRegex = /^[a-zA-Z0-9]*$/;
      if (value && !idRegex.test(value)) {
        setErrors(prev => ({ 
          ...prev, 
          [name]: 'Special characters are not allowed. Only letters and numbers are permitted.' 
        }));
      }
    }

    // Re-validate level and function fields on blur
    if (name === 'level' || name === 'function') {
      const textRegex = /^[a-zA-Z0-9\s]*$/;
      if (value && !textRegex.test(value)) {
        setErrors(prev => ({ 
          ...prev, 
          [name]: 'Special characters are not allowed. Only letters, numbers, and spaces are permitted.' 
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
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
    if (formData.function && !textRegex.test(formData.function)) {
      setErrors(prev => ({ 
        ...prev, 
        function: 'Special characters are not allowed. Only letters, numbers, and spaces are permitted.' 
      }));
      showToast('Please fix validation errors before submitting', 'error');
      return;
    }
    
    setSaving(true);

    try {
      await userApi.update(parseInt(id, 10), formData);
      showToast('User updated successfully', 'success');
      navigate('/master/users');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to update user', 'error');
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit User</h1>
        <Button onClick={() => navigate('/master/users')} variant="outline">
          Back to Users
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Staff ID"
            name="staffId"
            value={formData.staffId}
            onChange={handleChange}
            onBlur={handleFieldBlur}
            required
            disabled={saving}
            error={errors.staffId}
          />
          <Input
            label="Employee ID"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            onBlur={handleFieldBlur}
            disabled={saving}
            error={errors.employeeId}
          />
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={handleNameBlur}
            required
            disabled={saving}
            error={errors.firstName}
          />
          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            onBlur={handleNameBlur}
            disabled={saving}
            error={errors.lastName}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleEmailBlur}
            required
            disabled={saving}
            error={errors.email || emailError || undefined}
          />
          <div className="md:col-span-2">
            <Select
              label="Role"
              name="roleId"
              value={formData.roleId?.toString() || ''}
              onChange={(e) => {
                const roleId = parseInt(e.target.value, 10);
                setFormData(prev => ({
                  ...prev,
                  roleId: isNaN(roleId) ? undefined : roleId
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
              disabled={saving}
            />
          </div>
          <Select
            label="Department"
            name="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            options={[
              { value: '', label: 'Select a department', disabled: true },
              ...departments.map(dept => ({
                value: dept.name,
                label: dept.name
              }))
            ]}
            required
            disabled={saving}
          />
          <Input
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={saving}
          />
          <Input
            label="Level"
            name="level"
            value={formData.level}
            onChange={handleChange}
            onBlur={handleFieldBlur}
            disabled={saving}
            error={errors.level}
          />
          <Input
            label="dmtId"
            name="dmtId"
            value={formData.dmtId}
            onChange={handleChange}
            disabled={saving}
          />
          <Input
            label="Function"
            name="function"
            value={formData.function}
            onChange={handleChange}
            onBlur={handleFieldBlur}
            disabled={saving}
            error={errors.function}
          />
          <div className="md:col-span-2">
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              disabled={saving}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/master/users')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserEditPage;
