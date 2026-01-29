import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { assignmentApi } from '../../api/assignmentApi';
import { Assignment, PaginatedAssignmentsResponse } from '../../types/assignment.types';
import { AssignmentsTable } from '../../components/tables/AssignmentsTable';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import { useRole } from '../../hooks/useRole';
import AssignmentPreviewModal from '../../components/modals/AssignmentPreviewModal';
import Pagination from '../../components/common/Pagination';

const AssignmentsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { canAssignTraining } = useRole();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    assignment: Assignment | null;
  }>({ isOpen: false, assignment: null });
  const loadingRef = useRef(false);

  useEffect(() => {
    if (loadingRef.current) return;
    loadAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit]);

  const loadAssignments = async () => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      setLoading(true);
      const data: PaginatedAssignmentsResponse = await assignmentApi.getAll({
        page: currentPage,
        limit: limit,
      });
      setAssignments(data.assignments);
      setPagination({
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
        hasNext: data.pagination.hasNext,
        hasPrev: data.pagination.hasPrev,
      });
    } catch (error) {
      showToast('Failed to load assignments', 'error');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const [recipients, setRecipients] = useState<any[]>([]);

  const handleCreate = () => {
    navigate('/assignments/create');
  };

  const handleViewRecipients = async (assignment: Assignment) => {
    try {
      const recipientsData = await assignmentApi.getRecipients(assignment.id);
      setRecipients(recipientsData);
      setPreviewModal({ isOpen: true, assignment });
    } catch (error) {
      showToast('Failed to load recipients', 'error');
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
        <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
        {canAssignTraining && <Button onClick={handleCreate}>Assign Training</Button>}
      </div>

      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <Loader />
        ) : (
          <>
            <AssignmentsTable
              assignments={assignments}
              onViewRecipients={handleViewRecipients}
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

      <AssignmentPreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => {
          setPreviewModal({ isOpen: false, assignment: null });
          setRecipients([]);
        }}
        assignment={previewModal.assignment}
        recipients={recipients}
      />
    </div>
  );
};

export default AssignmentsListPage;

