import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import { User, PaginatedUsersResponse } from '../../types/user.types';
import { UsersTable } from '../../components/tables/UsersTable';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../../context/ToastContext';

const UsersPage: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (loadingRef.current) return;
    
    const loadUsers = async () => {
      try {
        loadingRef.current = true;
        setLoading(true);
        const data: PaginatedUsersResponse = await userApi.getAll({ search: debouncedSearch || undefined, function: '' });
        setUsers(data.users);
      } catch (error) {
        showToast('Failed to load users', 'error');
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };

    loadUsers();
  }, [debouncedSearch]);

  const navigate = useNavigate();

  const handleCreate = () => {
    navigate('/users/create');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={handleCreate}>
          Create User
        </Button>
      </div>

      <Input
        type="text"
        placeholder="Search by name, email, or staff ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? <Loader /> : <UsersTable users={users} />}
    </div>
  );
};

export default UsersPage;

