import React, { useEffect, useState, useRef } from 'react';
import { masterApi } from '../../api/masterApi';
import { DMT } from '../../types/ksa.types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import TextArea  from '../../components/common/TextArea';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import DataTable, { Column } from '../../components/tables/DataTable';

const DmtPage: React.FC = () => {
  const { showToast } = useToast();
  const [dmtList, setDmtList] = useState<DMT[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<DMT>({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const loadingRef = useRef(false);

  const loadDMT = async () => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      setLoading(true);
      const data = await masterApi.getDMT();
      setDmtList(data);
    } catch (error) {
      showToast('Failed to load DMT', 'error');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    loadDMT();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await masterApi.createDMT(formData);
      showToast('DMT created successfully', 'success');
      setShowForm(false);
      setFormData({ name: '', description: '' });
      loadDMT();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to create DMT', 'error');
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<DMT>[] = [
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">DMT (Department/Team)</h1>
        <Button onClick={() => setShowForm(true)}>Create DMT</Button>
      </div>

      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <Loader />
        ) : (
          <DataTable columns={columns} data={dmtList} emptyMessage="No DMT found" />
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create DMT">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

export default DmtPage;

