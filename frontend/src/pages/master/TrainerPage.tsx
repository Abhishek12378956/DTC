import React, { useEffect, useState, useRef } from 'react';
import { trainerApi } from '../../api/trainerApi';
import { categoryApi } from '../../api/categoryApi';
import { Trainer, TrainerCreateInput } from '../../types/trainer.types';
import { CategoryOption } from '../../types/category.types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import TextArea from '../../components/common/TextArea';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import DataTable, { Column } from '../../components/tables/DataTable';

const TrainerPage: React.FC = () => {
  const { showToast } = useToast();
  const [trainerList, setTrainerList] = useState<Trainer[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TrainerCreateInput>({ 
    trainerName: '', 
    trainerType: 'internal',
    profession: '',
    company: '',
    location: '',
    qualification: '',
    purpose: '',
    categoryId: undefined,
    is_active: true 
  });
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [saving, setSaving] = useState(false);
  const loadingRef = useRef(false);

  const loadTrainers = async () => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      setLoading(true);
      const response = await trainerApi.getTrainers({ page: 1, limit: 1000 });
      setTrainerList(response.trainers);
    } catch (error) {
      showToast('Failed to load trainers', 'error');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryApi.getActiveCategories();
      setCategories(response);
    } catch (error) {
      showToast('Failed to load categories', 'error');
    }
  };

  useEffect(() => {
    loadTrainers();
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.trainerName.trim()) {
      showToast('Trainer name is required', 'error');
      return;
    }

    if (!formData.trainerType) {
      showToast('Trainer type is required', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingTrainer) {
        await trainerApi.updateTrainer(editingTrainer.id!, formData);
        showToast('Trainer updated successfully', 'success');
      } else {
        await trainerApi.createTrainer(formData);
        showToast('Trainer created successfully', 'success');
      }
      
      setShowForm(false);
      setFormData({ 
        trainerName: '', 
        trainerType: 'internal',
        profession: '',
        company: '',
        location: '',
        qualification: '',
        purpose: '',
        categoryId: undefined,
        is_active: true 
      });
      setEditingTrainer(null);
      loadTrainers();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save trainer', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      trainerName: trainer.trainerName,
      trainerType: trainer.trainerType,
      profession: trainer.profession || '',
      company: trainer.company || '',
      location: trainer.location || '',
      qualification: trainer.qualification || '',
      purpose: trainer.purpose || '',
      categoryId: trainer.categoryId,
      is_active: trainer.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (trainer: Trainer) => {
    if (!window.confirm(`Are you sure you want to disable "${trainer.trainerName}"?`)) {
      return;
    }

    try {
      await trainerApi.deleteTrainer(trainer.id!);
      showToast('Trainer disabled successfully', 'success');
      loadTrainers();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to disable trainer', 'error');
    }
  };

  const openAddForm = () => {
    setEditingTrainer(null);
    setFormData({ 
      trainerName: '', 
      trainerType: 'internal',
      profession: '',
      company: '',
      location: '',
      qualification: '',
      purpose: '',
      categoryId: undefined,
      is_active: true 
    });
    setShowForm(true);
  };

  const columns: Column<Trainer>[] = [
    {
      key: 'trainerName',
      header: 'Trainer Name',
      mobileLabel: 'Name'
    },
    {
      key: 'trainerType',
      header: 'Type',
      mobileLabel: 'Type',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'internal'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-purple-100 text-purple-800'
          }`}
        >
          {value === 'internal' ? 'Internal' : 'External'}
        </span>
      )
    },
    {
      key: 'profession',
      header: 'Profession',
      mobileLabel: 'Profession',
      render: (value) => value || '-'
    },
    {
      key: 'company',
      header: 'Company',
      mobileLabel: 'Company',
      hideOnMobile: true,
      render: (value) => value || '-'
    },
    {
      key: 'location',
      header: 'Location',
      mobileLabel: 'Location',
      hideOnMobile: true,
      render: (value) => value || '-'
    },
    {
      key: 'categoryName',
      header: 'Category',
      mobileLabel: 'Category',
      hideOnMobile: true,
      render: (value) => value || '-'
    },
    {
      key: 'is_active',
      header: 'Status',
      mobileLabel: 'Status',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? 'Active' : 'Disabled'}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
      mobileLabel: 'Created',
      hideOnMobile: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      key: 'actions',
      header: 'Actions',
      mobileLabel: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <span
            className="text-blue-600 hover:text-blue-800 cursor-pointer"
            onClick={() => handleEdit(row)}
          >
            Edit
          </span>
          <span
            className="text-red-600 hover:text-red-800 cursor-pointer"
            onClick={() => handleDelete(row)}
          >
            Delete
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trainer Management</h1>
        <Button onClick={openAddForm}>
          Add New Trainer
        </Button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <DataTable
          columns={columns}
          data={trainerList}
        />
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Trainer Name *"
              name="trainerName"
              value={formData.trainerName}
              onChange={(e) => setFormData({ ...formData, trainerName: e.target.value })}
              required
              placeholder="Enter trainer name"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trainer Type *
              </label>
              <select
                name="trainerType"
                value={formData.trainerType}
                onChange={(e) => setFormData({ ...formData, trainerType: e.target.value as 'internal' | 'external' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="internal">Internal</option>
                <option value="external">External</option>
              </select>
            </div>

            <Input
              label="Profession"
              name="profession"
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              placeholder="Enter profession"
            />

            <Input
              label="Company"
              name="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Enter company"
            />

            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter location"
            />

            <Input
              label="Qualification"
              name="qualification"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              placeholder="Enter qualification"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Belong
              </label>
              <select
                name="categoryId"
                value={formData.categoryId || ''}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <TextArea
            label="Purpose"
            name="purpose"
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            placeholder="Enter purpose (optional)"
            rows={3}
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowForm(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : (editingTrainer ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TrainerPage;
