import React, { useEffect, useState, useRef } from 'react';
import { masterApi } from '../../api/masterApi';
import { Position } from '../../types/ksa.types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import TextArea from '../../components/common/TextArea';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import DataTable, { Column } from '../../components/tables/DataTable';

const PositionsPage: React.FC = () => {
  const { showToast } = useToast();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Position>({ code: '', title: '', description: '' });
  const [saving, setSaving] = useState(false);
  const loadingRef = useRef(false);

  const loadPositions = async () => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      setLoading(true);
      const data = await masterApi.getPositions();
      setPositions(data);
    } catch (error) {
      showToast('Failed to load positions', 'error');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    loadPositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await masterApi.createPosition(formData);
      showToast('Position created successfully', 'success');
      setShowForm(false);
      setFormData({ code: '', title: '', description: '' });
      loadPositions();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to create position', 'error');
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Position>[] = [
    { key: 'code', header: 'Code' },
    { key: 'title', header: 'Title' },
    { key: 'description', header: 'Description' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Positions</h1>
        <Button onClick={() => setShowForm(true)}>Create Position</Button>
      </div>

      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <Loader />
        ) : (
          <DataTable columns={columns} data={positions} emptyMessage="No positions found" />
        )}
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Create Position"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Code *"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
          />
          <Input
            label="Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <TextArea
            label="Description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PositionsPage;

