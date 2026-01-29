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
import { useRole } from '../../hooks/useRole';
import ConfirmModal from '../../components/modals/ConfirmModal';
import Pagination from '../../components/common/Pagination';

const UsersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { canManageUsers } = useRole();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search, 500);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (loadingRef.current) return;
    loadUsers();
  }, [debouncedSearch, currentPage, limit]);

  const loadUsers = async () => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      setLoading(true);
      const data: PaginatedUsersResponse = await userApi.getAll({ 
        search: debouncedSearch || undefined, 
        function: '',
        page: currentPage,
        limit: limit,
      });
      setUsers(data.users);
      setPagination({
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
        hasNext: data.pagination.hasNext,
        hasPrev: data.pagination.hasPrev,
      });
    } catch (error) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const handleCreate = () => {
    navigate('/master/users/create');
  };

  const handleEdit = (user: User) => {
    navigate(`/master/users/edit/${user.id}`);
  };

  const handleDeleteClick = (user: User) => {
    setDeleteModal({ isOpen: true, user });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.user?.id) return;       // here we are checking if the user id is not null
    
    try {
      setDeleting(true);
      await userApi.delete(deleteModal.user.id);
      showToast('User deleted successfully', 'success');
      loadUsers();
    } catch (error) {
      showToast('Failed to delete user', 'error');
    } finally {
      setDeleting(false);
      setDeleteModal({ isOpen: false, user: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, user: null });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        {canManageUsers && (
          <Button onClick={handleCreate}>
            Create User
          </Button>
        )}
      </div>

      <Input
        type="text"
        placeholder="Search by name, email, or staff ID..."
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
      />

      {loading ? (
        <Loader />
      ) : (
        <>
          <UsersTable 
            users={users} 
            onEdit={canManageUsers ? handleEdit : undefined}
            onDelete={canManageUsers ? handleDeleteClick : undefined}
          />
          
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            hasNext={pagination.hasNext}
            hasPrev={pagination.hasPrev}
            total={pagination.total}
            limit={limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete User"
        message={`Are you sure you want to delete user ${deleteModal.user?.firstName} ${deleteModal.user?.lastName}?`}
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteCancel}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        variant="danger"
        isLoading={deleting}       />
    </div>
  );
};

export default UsersListPage;
