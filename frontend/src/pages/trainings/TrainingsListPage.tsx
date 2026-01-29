import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainingApi } from '../../api/trainingApi';
import { Training, PaginatedTrainingsResponse } from '../../types/training.types';
import { TrainingsTable } from '../../components/tables/TrainingsTable';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../../context/ToastContext';
import { useRole } from '../../hooks/useRole';
import ConfirmModal from '../../components/modals/ConfirmModal';
import Pagination from '../../components/common/Pagination';

const TrainingsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { canAssignTraining } = useRole();
  const [trainings, setTrainings] = useState<Training[]>([]);
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
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; training: Training | null }>({
    isOpen: false,
    training: null,
  });
  const debouncedSearch = useDebounce(search, 500);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (loadingRef.current) return;
    loadTrainings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, currentPage, limit]);

  const loadTrainings = async () => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      setLoading(true);
      const data: PaginatedTrainingsResponse = await trainingApi.getAll({
        search: debouncedSearch || undefined,
        page: currentPage,
        limit: limit,
      });
      setTrainings(data.data); // Changed from data.trainings to data.data
      setPagination({
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
        hasNext: data.pagination.hasNext,
        hasPrev: data.pagination.hasPrev,
      });
    } catch (error) {
      console.error('Error loading trainings:', error);
      showToast('Failed to load trainings', 'error');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const handleCreate = () => {
    navigate('/trainings/create');
  };

  const handleEdit = async (training: Training) => {
    navigate(`/trainings/${training.id}/edit`);
  };

  const handleDeleteClick = async (training: Training) => {
    setDeleteModal({ isOpen: true, training });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.training?.id) return;

    try {
      await trainingApi.delete(deleteModal.training.id);
      showToast('Training deleted successfully', 'success');
      loadTrainings();
      setDeleteModal({ isOpen: false, training: null });
    } catch (error) {
      showToast('Failed to delete training', 'error');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Trainings</h1>
        {canAssignTraining && (
          <Button onClick={handleCreate}>Create Training</Button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b">
          <Input
            type="text"
            placeholder="Search trainings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <Loader />
        ) : (
          <>
            <TrainingsTable
              trainings={trainings}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
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
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, training: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Training"
        message={`Are you sure you want to delete "${deleteModal.training?.topic}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default TrainingsListPage;

