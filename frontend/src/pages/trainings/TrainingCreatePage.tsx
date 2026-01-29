import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainingApi } from '../../api/trainingApi';
import { categoryApi } from '../../api/categoryApi';
import { trainerApi } from '../../api/trainerApi';
import { venueApi } from '../../api/venueApi';
import { TrainingCreateInput } from '../../types/training.types';
import { CategoryOption } from '../../types/category.types';
import { TrainerOption } from '../../types/trainer.types';
import { VenueOption } from '../../types/venue.types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import TextArea from '../../components/common/TextArea';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../../components/common/Loader';

const TrainingCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const now = new Date();
  const nowLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [trainerOptions, setTrainerOptions] = useState<TrainerOption[]>([]);
  const [venueOptions, setVenueOptions] = useState<VenueOption[]>([]);

  const [formData, setFormData] = useState<TrainingCreateInput>({
    topic: '',
    description: '',
    venueId: undefined,
    trainingStartDate: '',
    trainingEndDate: '',
    trainerId: 0,
    duration: undefined,
    categoryId: undefined,
    createdBy: user?.id || 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load categories, trainers, and venues on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await categoryApi.getActiveCategories();
        setCategoryOptions(categories);
      } catch (error) {
        showToast('Failed to load categories', 'error');
      }
    };

    const loadTrainers = async () => {
      try {
        const trainers = await trainerApi.getActiveTrainers();
        setTrainerOptions(trainers);
      } catch (error) {
        showToast('Failed to load trainers', 'error');
      }
    };

    const loadVenues = async () => {
      try {
        const venues = await venueApi.getActiveVenues();
        setVenueOptions(venues);
      } catch (error) {
        showToast('Failed to load venues', 'error');
      }
    };

    loadCategories();
    loadTrainers();
    loadVenues();
  }, [showToast]);

  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Clear error for this field first
    setErrors(prev => ({ ...prev, [name]: '' }));

    // Re-validate topic field on blur
    if (name === 'topic') {
      const fieldRegex = /^[a-zA-Z\s]*$/;
      if (value && !fieldRegex.test(value)) {
        setErrors(prev => ({ 
          ...prev, 
          [name]: 'Special characters and numbers are not allowed. Only letters and spaces are permitted.' 
        }));
      }
    }
  };

  // Calculate duration whenever start/end dates or times change
  useEffect(() => {
    const calculateDuration = () => {
      if (!formData.trainingStartDate || !formData.trainingEndDate) return;

      const startDateTime = new Date(formData.trainingStartDate);
      const endDateTime = new Date(formData.trainingEndDate);

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) return;

      const diffInMs = endDateTime.getTime() - startDateTime.getTime();
      const diffInMinutes = diffInMs / (1000 * 60);

      setFormData((prev) => ({ ...prev, duration: Math.floor(diffInMinutes) }));
    };

    calculateDuration();
  }, [formData.trainingStartDate, formData.trainingEndDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear previous error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
    
    // Validate topic field to prevent special characters and numbers
    if (name === 'topic') {
      // Allow only letters and spaces
      const fieldRegex = /^[a-zA-Z\s]*$/;
      if (!fieldRegex.test(value)) {
        setErrors(prev => ({ 
          ...prev, 
          [name]: 'Special characters and numbers are not allowed. Only letters and spaces are permitted.' 
        }));
        return; // Don't update the form data if validation fails
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTrainerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const trainerId = e.target.value ? Number(e.target.value) : 0;
    setFormData(prev => ({ ...prev, trainerId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.trainingStartDate || !formData.trainingEndDate) {
      showToast('Please select training start and end date/time', 'error');
      return;
    }

    if (!formData.trainerId || formData.trainerId === 0) {
      showToast('Please select a trainer', 'error');
      return;
    }

    // Validate topic field
    const fieldRegex = /^[a-zA-Z\s]*$/;
    if (!fieldRegex.test(formData.topic)) {
      setErrors(prev => ({ 
        ...prev, 
        topic: 'Special characters and numbers are not allowed. Only letters and spaces are permitted.' 
      }));
      showToast('Please fix validation errors before submitting', 'error');
      return;
    }

    const startDateTime = new Date(formData.trainingStartDate);
    const endDateTime = new Date(formData.trainingEndDate);
    
    if (endDateTime <= startDateTime) {
      showToast('End date/time must be after start date/time', 'error');
      return;
    }

    setLoading(true);

    try {
      await trainingApi.create(formData);
      showToast('Training created successfully', 'success');
      navigate('/trainings');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to create training', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.topic) {
    return <Loader />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Create Training</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <Input
          label="Topic *"
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          onBlur={handleFieldBlur}
          required
          error={errors.topic}
        />

        <TextArea
          label="Description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={3}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Venue
          </label>
          <select
            name="venueId"
            value={formData.venueId?.toString() || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, venueId: e.target.value ? Number(e.target.value) : undefined }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a venue</option>
            {venueOptions.map((venue) => (
              <option key={venue.value} value={venue.value}>
                {venue.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="datetime-local"
            label="Training Start Date & Time *"
            name="trainingStartDate"
            value={formData.trainingStartDate || ''}
            onChange={handleChange}
            min={nowLocal}
          />

          <Input
            type="datetime-local"
            label="Training End Date & Time *"
            name="trainingEndDate"
            value={formData.trainingEndDate || ''}
            onChange={handleChange}
            min={formData.trainingStartDate || nowLocal}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trainer/Faculty
          </label>
          <select
            name="trainerId"
            value={formData.trainerId || ''}
            onChange={handleTrainerChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a trainer</option>
            {trainerOptions.map((trainer) => (
              <option key={trainer.value} value={trainer.value}>
                {trainer.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              type="text"
              label="Duration"
              value={(() => {
                if (!formData.duration) return '';
                const minutes = formData.duration;
                if (minutes >= 7 * 24 * 60) {
                  const weeks = Math.floor(minutes / (7 * 24 * 60));
                  const remainingMinutes = minutes % (7 * 24 * 60);
                  const remainingDays = Math.floor(remainingMinutes / (24 * 60));
                  const remainingHours = Math.floor((remainingMinutes % (24 * 60)) / 60);
                  const finalMinutes = Math.floor(remainingMinutes % 60);
                  
                  if (finalMinutes > 0) {
                    return remainingHours > 0 ? `${weeks} weeks ${remainingDays} days ${remainingHours} hours and ${finalMinutes} minutes` : `${weeks} weeks ${remainingDays} days and ${finalMinutes} minutes`;
                  }
                  if (remainingHours > 0) {
                    return `${weeks} weeks ${remainingDays} days ${remainingHours} hours`;
                  }
                  if (remainingDays > 0) {
                    return `${weeks} weeks ${remainingDays} days`;
                  }
                  return weeks > 1 ? `${weeks} weeks` : `${weeks} week`;
                } else if (minutes >= 24 * 60) {
                  const days = Math.floor(minutes / (24 * 60));
                  const remainingHours = Math.floor((minutes % (24 * 60)) / 60);
                  return `${days} days ${remainingHours > 0 ? remainingHours + ' hours' : ''}`;
                } else if (minutes >= 60) {
                  const hours = Math.floor(minutes / 60);
                  const remainingMinutes = Math.floor(minutes % 60);
                  return remainingMinutes > 0 ? `${hours} hours ${remainingMinutes} minutes` : `${hours} hours`;
                } else {
                  return `${minutes} minutes`;
                }
              })()}
              readOnly
              className="bg-gray-50"
              placeholder="Auto-calculated from dates"
            />
            <p className="text-sm text-gray-500 mt-1">
              Automatically calculated based on start/end date and time
            </p>
          </div>

          <Select
            label="Category"
            name="categoryId"
            value={formData.categoryId?.toString() || ''}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select a category' },
              ...categoryOptions
            ]}
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Training Type</h3>
          <p className="text-sm text-blue-600">
            {formData.trainingStartDate && formData.trainingEndDate &&
            formData.trainingStartDate.split('T')[0] === formData.trainingEndDate.split('T')[0] 
              ? "Single Day Training" 
              : "Multi-Day Training"}
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/trainings')}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Create Training
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TrainingCreatePage;

