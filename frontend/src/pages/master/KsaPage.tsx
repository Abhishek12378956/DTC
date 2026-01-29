import React, { useEffect, useState, useRef } from 'react';
import { masterApi } from '../../api/masterApi';
import { KSA } from '../../types/ksa.types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import TextArea from '../../components/common/TextArea';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import DataTable, { Column } from '../../components/tables/DataTable';

const KsaPage: React.FC = () => {
  const { showToast } = useToast();
  const [ksaList, setKsaList] = useState<KSA[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<KSA>({ code: '', name: '', description: '', category: '' });
  const [saving, setSaving] = useState(false);
  const loadingRef = useRef(false);

  const loadKSA = async () => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      setLoading(true);
      const data = await masterApi.getKSA();
      setKsaList(data);
    } catch (error) {
      showToast('Failed to load KSA', 'error');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    loadKSA();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await masterApi.createKSA(formData);
      showToast('KSA created successfully', 'success');
      setShowForm(false);
      setFormData({ code: '', name: '', description: '', category: '' });
      loadKSA();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to create KSA', 'error');
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<KSA>[] = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category' },
    { key: 'description', header: 'Description' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">KSA (Knowledge/Skill/Attitude)</h1>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">Create KSA</Button>
      </div>

      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <Loader />
        ) : (
          <DataTable columns={columns} data={ksaList} emptyMessage="No KSA found" />
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create KSA">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Code *"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
          />
          <Input
            label="Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Category"
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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

export default KsaPage;

