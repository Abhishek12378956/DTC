import React, { useEffect, useState, useRef } from 'react';
import { categoryApi } from '../../api/categoryApi';
import { Category, CategoryCreateInput } from '../../types/category.types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import TextArea from '../../components/common/TextArea';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import DataTable, { Column } from '../../components/tables/DataTable';

const CategoryPage: React.FC = () => {
  const { showToast } = useToast();
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CategoryCreateInput>({ name: '', description: '', is_active: true });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const loadingRef = useRef(false);

  const loadCategories = async () => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      setLoading(true);
      const response = await categoryApi.getCategories({ page: 1, limit: 1000 });
      setCategoryList(response.categories);
    } catch (error) {
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await categoryApi.updateCategory(editingCategory.id!, formData);
        showToast('Category updated successfully', 'success');
      } else {
        await categoryApi.createCategory(formData);
        showToast('Category created successfully', 'success');
      }
      
      setShowForm(false);
      setFormData({ name: '', description: '', is_active: true });
      setEditingCategory(null);
      loadCategories();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      is_active: category.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Are you sure you want to disable "${category.name}"?`)) {
      return;
    }

    try {
      await categoryApi.deleteCategory(category.id!);
      showToast('Category disabled successfully', 'success');
      loadCategories();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to disable category', 'error');
    }
  };

  const openAddForm = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', is_active: true });
    setShowForm(true);
  };

  const columns: Column<Category>[] = [
    {
      key: 'name',
      header: 'Name',
      mobileLabel: 'Name'
    },
    {
      key: 'description',
      header: 'Description',
      mobileLabel: 'Description',
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
        <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
        <Button onClick={openAddForm}>
          Add New Category
        </Button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <DataTable
          columns={columns}
          data={categoryList}
        />
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Enter category name"
          />

          <TextArea
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter category description (optional)"
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
              {saving ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoryPage;
