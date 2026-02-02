import React, { useEffect, useState, useRef } from 'react';
import { venueApi } from '../../api/venueApi';
import { Venue, VenueCreateInput, Location } from '../../types/venue.types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import TextArea from '../../components/common/TextArea';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import DataTable, { Column } from '../../components/tables/DataTable';

const VenuePage: React.FC = () => {
  const { showToast } = useToast();
  const [venueList, setVenueList] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<VenueCreateInput>({ 
    name: '', 
    description: '', 
    locationId: 0,
    is_active: true 
  });
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [saving, setSaving] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [venueConferences, setVenueConferences] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const loadingRef = useRef(false);

  const loadVenues = async () => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      setLoading(true);
      const response = await venueApi.getVenues({ page: 1, limit: 1000 });
      setVenueList(response.venues);
    } catch (error) {
      showToast('Failed to load venues', 'error');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    loadVenues();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!locationName.trim()) {
      showToast('Location name is required', 'error');
      return;
    }

    // Filter out empty venue conferences
    const validConferences = venueConferences.filter(conf => conf.trim() !== '');
    
    if (validConferences.length === 0) {
      showToast('At least one venue conference is required', 'error');
      return;
    }

    setSaving(true);
    try {
      // For now, we'll need to handle this differently since we're not using dropdown
      // We'll need to either create a new location or find an existing one
      // For simplicity, let's assume we're creating a new venue with a new location
      // This will need backend support to handle location creation/lookup
      
      if (editingVenue) {
        // For editing, we only update the single venue
        await venueApi.updateVenue(editingVenue.id!, formData);
        showToast('Venue updated successfully', 'success');
      } else {
        // For creating, we create multiple venues for each conference
        for (const conference of validConferences) {
          const venueData = {
            ...formData,
            name: conference.trim()
          };
          await venueApi.createVenue(venueData);
        }
        showToast(`${validConferences.length} venue(s) created successfully`, 'success');
      }
      
      setShowForm(false);
      setFormData({ name: '', description: '', locationId: 0, is_active: true });
      setLocationName('');
      setVenueConferences([]);
      setCurrentInput('');
      setEditingVenue(null);
      loadVenues();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save venue', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addVenueConference = () => {
    if (currentInput.trim() !== '') {
      setVenueConferences([...venueConferences, currentInput.trim()]);
      setCurrentInput(''); // Clear the input for next entry
    }
  };

  const removeVenueConference = (index: number) => {
    const newConferences = venueConferences.filter((_, i) => i !== index);
    setVenueConferences(newConferences);
  };

  const handleEdit = (venue: Venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name,
      description: venue.description || '',
      locationId: venue.locationId || 0,
      is_active: venue.is_active
    });
    setLocationName(venue.locationName || '');
    setVenueConferences([venue.name]); // For editing, show only the current venue
    setCurrentInput('');
    setShowForm(true);
  };

  const handleDelete = async (venue: Venue) => {
    if (!window.confirm(`Are you sure you want to disable "${venue.name}"?`)) {
      return;
    }

    try {
      await venueApi.deleteVenue(venue.id!);
      showToast('Venue disabled successfully', 'success');
      loadVenues();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to disable venue', 'error');
    }
  };

  const openAddForm = () => {
    setEditingVenue(null);
    setFormData({ name: '', description: '', locationId: 0, is_active: true });
    setLocationName('');
    setVenueConferences([]);
    setCurrentInput('');
    setShowForm(true);
  };

  const columns: Column<Venue>[] = [
    {
      key: 'locationName',
      header: 'Location',
      mobileLabel: 'Location',
      render: (value) => value || '-'
    },
    {
      key: 'name',
      header: 'Venue Conference',
      mobileLabel: 'Venue Conference'
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
        <h1 className="text-2xl font-bold text-gray-900">Venue Management</h1>
        <Button onClick={openAddForm}>
          Add New Venue
        </Button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <DataTable
          columns={columns}
          data={venueList}
        />
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingVenue ? 'Edit Venue' : 'Add New Venue'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Location *"
            name="location"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="Enter location name"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue Conferences *
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {venueConferences.map((conference, index) => (
                <div
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
                >
                  {conference}
                  <button
                    type="button"
                    onClick={() => removeVenueConference(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="relative">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Enter conference room name"
                className="pr-12"
              />
              {currentInput.trim() !== '' && (
                <button
                  type="button"
                  onClick={addVenueConference}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 focus:outline-none"
                  title="Add this venue conference"
                >
                  ✓
                </button>
              )}
            </div>
          </div>

          <TextArea
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter venue description (optional)"
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
              {saving ? 'Saving...' : (editingVenue ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VenuePage;
