import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { trainingApi } from '../../api/trainingApi';
import { categoryApi } from '../../api/categoryApi';
import { venueApi } from '../../api/venueApi';
import { Training, TrainingUpdateInput } from '../../types/training.types';
import { CategoryOption } from '../../types/category.types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import TextArea from '../../components/common/TextArea';
import { Select } from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/common/Loader';

const TrainingEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [training, setTraining] = useState<Training | null>(null);
  const loadingRef = useRef(false);
  const [formData, setFormData] = useState<TrainingUpdateInput>({
    topic: '',
    description: '',
    venueId: undefined,
    trainingStartDate: '',
    trainingEndDate: '',
    trainerId: 0,
    duration: undefined,
    categoryId: undefined,
    status: 'active',
  });

  const [trainers, setTrainers] = useState<any[]>([]);
  const [loadingTrainers, setLoadingTrainers] = useState(true);
  const [venues, setVenues] = useState<any[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Clear error for this field first
    setErrors(prev => ({ ...prev, [name]: '' }));

    // Re-validate topic and venue fields on blur
    if (name === 'topic' || name === 'venue') {
      const fieldRegex = /^[a-zA-Z\s]*$/;
      if (value && !fieldRegex.test(value)) {
        setErrors(prev => ({ 
          ...prev, 
          [name]: 'Special characters and numbers are not allowed. Only letters and spaces are permitted.' 
        }));
      }
    }
  };

  useEffect(() => {
    if (id && !loadingRef.current) {
      loadTraining();
    }
    // Fetch trainers
    const fetchTrainers = async () => {
      try {
        setLoadingTrainers(true);
        // Fetch trainings and extract unique trainers
        const response = await trainingApi.getAll({ page: 1, limit: 100 }); // Get more trainings to extract all trainers
        const trainings = response.data;
        
        // Extract unique trainers from trainings
        const uniqueTrainersMap = new Map<number, any>();
        trainings.forEach(training => {
          if (training.trainer && !uniqueTrainersMap.has(training.trainer.id)) {
            uniqueTrainersMap.set(training.trainer.id, {
              id: training.trainer.id,
              firstName: training.trainer.name.split(' ')[0],
              lastName: training.trainer.name.split(' ').slice(1).join(' '),
              name: training.trainer.name,
              type: training.trainer.type
            });
          }
        });
        
        setTrainers(Array.from(uniqueTrainersMap.values()));
      } catch (error) {
        console.error('Failed to fetch trainers:', error);
      } finally {
        setLoadingTrainers(false);
      }
    };
    fetchTrainers();
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const categories = await categoryApi.getActiveCategories();
        setCategoryOptions(categories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
    
    // Fetch venues
    const fetchVenues = async () => {
      try {
        const venuesData = await venueApi.getVenues();
        setVenues(venuesData.venues);
      } catch (error) {
        console.error('Failed to fetch venues:', error);
      }
    };
    fetchVenues();
  }, [id]);

  const loadTraining = async () => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      setLoading(true);
      const data = await trainingApi.getById(parseInt(id!));
      setTraining(data);
      
      // Format date for datetime-local input (YYYY-MM-DDTHH:MM) in local timezone
      let formattedStartDate = '';
      let formattedEndDate = '';
      if (data.trainingStartDate) {
        try {
          const date = new Date(data.trainingStartDate);
          if (!isNaN(date.getTime())) {
            // Format to local timezone: YYYY-MM-DDTHH:MM
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            formattedStartDate = `${year}-${month}-${day}T${hours}:${minutes}`;
          }
        } catch (e) {
          console.error('Error parsing start date:', e);
        }
      }
      if (data.trainingEndDate) {
        try {
          const date = new Date(data.trainingEndDate);
          if (!isNaN(date.getTime())) {
            // Format to local timezone: YYYY-MM-DDTHH:MM
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            formattedEndDate = `${year}-${month}-${day}T${hours}:${minutes}`;
          }
        } catch (e) {
          console.error('Error parsing end date:', e);
        }
      }
      
      // Calculate duration from start and end dates
      let calculatedDuration = data.duration;
      if (data.trainingStartDate && data.trainingEndDate) {
        try {
          const startDate = new Date(data.trainingStartDate);
          const endDate = new Date(data.trainingEndDate);
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            const diffMs = endDate.getTime() - startDate.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            calculatedDuration = Math.round(diffHours * 100) / 100; // Round to 2 decimal places
          }
        } catch (e) {
          console.error('Error calculating duration:', e);
        }
      }
      
      setFormData({
        topic: data.topic || '',
        description: data.description || '',
        venueId: data.venue?.id || undefined,
        trainingStartDate: formattedStartDate,
        trainingEndDate: formattedEndDate,
        trainerId: data.trainerId || 0,
        duration: calculatedDuration,
        categoryId: data.categoryId || undefined,
        status: data.status || 'active',
      });
    } catch (error) {
      showToast('Failed to load training', 'error');
      navigate('/trainings');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  // Calculate duration when dates change
  const calculateDuration = (startDate: string | undefined, endDate: string | undefined) => {
    if (startDate && endDate) {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const diffMs = end.getTime() - start.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);
          return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
        }
      } catch (e) {
        console.error('Error calculating duration:', e);
      }
    }
    return undefined;
  };

  // Format duration for display and input
  const formatDuration = (hours: number | undefined) => {
    if (!hours) return '';
    
    if (hours < 1) {
      const totalMinutes = Math.round(hours * 60);
      if (totalMinutes === 60) {
        return '1 hour';
      } else if (totalMinutes > 60) {
        const displayHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        return remainingMinutes > 0 ? `${displayHours} hours and ${remainingMinutes} minutes` : `${displayHours} hours`;
      } else {
        return `${totalMinutes} minutes`;
      }
    } else if (hours < 24) {
      const displayHours = Math.floor(hours);
      const remainingMinutes = Math.round((hours % 1) * 60);
      return remainingMinutes > 0 ? `${displayHours} hours and ${remainingMinutes} minutes` : `${displayHours} hours`;
    } else if (hours >= 24 && hours < 168) { // 24 hours to 7 days
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round((hours % 24) * 100) / 100;
      const remainingMinutes = Math.round(((hours % 24) % 1) * 60);
      if (remainingMinutes > 0) {
        return remainingHours > 0 ? `${days} days ${remainingHours} hours and ${remainingMinutes} minutes` : `${days} days and ${remainingMinutes} minutes`;
      }
      return remainingHours > 0 ? `${days} days ${remainingHours} hours` : `${days} days`;
    } else { // 7 days or more
      const weeks = Math.floor(hours / 168); // 168 hours = 7 days
      const remainingHours = Math.round((hours % 168) * 100) / 100;
      const remainingMinutes = Math.round(((hours % 168) % 1) * 60);
      
      if (remainingMinutes > 0) {
        const remainingDays = Math.floor(remainingHours / 24);
        const finalHours = Math.round((remainingHours % 24) * 100) / 100;
        const finalMinutes = Math.round(((remainingHours % 24) % 1) * 60);
        
        if (finalMinutes > 0) {
          return finalHours > 0 ? `${weeks} weeks ${remainingDays} days ${finalHours} hours and ${finalMinutes} minutes` : `${weeks} weeks ${remainingDays} days and ${finalMinutes} minutes`;
        }
        if (finalHours > 0) {
          return `${weeks} weeks ${remainingDays} days ${finalHours} hours`;
        }
        return `${weeks} weeks ${remainingDays} days`;
      }
      if (remainingHours > 0) {
        const remainingDays = Math.floor(remainingHours / 24);
        const finalHours = Math.round((remainingHours % 24) * 100) / 100;
        return finalHours > 0 && remainingDays > 0 ? `${weeks} weeks ${remainingDays} days ${finalHours} hours` : `${weeks} weeks ${remainingHours} hours`;
      }
      return `${weeks} weeks`;
    }
  };

  // Convert formatted duration back to decimal hours for input
  const parseDurationToHours = (formattedDuration: string): number | undefined => {
    if (!formattedDuration) return undefined;
    
    // Parse "X hours and Y minutes" format
    const hoursAndMinutesMatch = formattedDuration.match(/(\d+)\s*hours?\s*and\s*(\d+)\s*minutes?/i);
    if (hoursAndMinutesMatch) {
      const hours = parseInt(hoursAndMinutesMatch[1]);
      const minutes = parseInt(hoursAndMinutesMatch[2]);
      return hours + (minutes / 60);
    }
    
    // Parse "X hours" format
    const hoursOnlyMatch = formattedDuration.match(/(\d+)\s*hours?/i);
    if (hoursOnlyMatch) {
      return parseInt(hoursOnlyMatch[1]);
    }
    
    // Parse "X minutes" format
    const minutesOnlyMatch = formattedDuration.match(/(\d+)\s*minutes?/i);
    if (minutesOnlyMatch) {
      return parseInt(minutesOnlyMatch[1]) / 60;
    }
    
    // Parse days and weeks formats
    const daysMatch = formattedDuration.match(/(\d+)\s*days?/i);
    const weeksMatch = formattedDuration.match(/(\d+)\s*weeks?/i);
    
    if (daysMatch || weeksMatch) {
      // For complex formats, return the original decimal value
      return formData.duration; // Keep original value for complex formats
    }
    
    return undefined;
  };

  const handleTrainerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const trainerId = e.target.value ? Number(e.target.value) : 0;
    setFormData(prev => ({ ...prev, trainerId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.trainerId || formData.trainerId === 0) {
      showToast('Please select a trainer', 'error');
      setSaving(false);
      return;
    }

    // Validate topic and venue fields
    const fieldRegex = /^[a-zA-Z\s]*$/;
    if (formData.topic && !fieldRegex.test(formData.topic)) {
      setErrors(prev => ({ 
        ...prev, 
        topic: 'Special characters and numbers are not allowed. Only letters and spaces are permitted.' 
      }));
      showToast('Please fix validation errors before submitting', 'error');
      setSaving(false);
      return;
    }
    
    setSaving(true);

    try {
      // Format the date properly for the backend (send as ISO string)
      const updateData: TrainingUpdateInput = {
        ...formData,
        trainingStartDate: formData.trainingStartDate || undefined,
        trainingEndDate: formData.trainingEndDate || undefined,
      };
      await trainingApi.update(parseInt(id!), updateData);
      showToast('Training updated successfully', 'success');
      // navigate(`/trainings/${id}`);
      navigate(`/trainings`);
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to update training', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!training) {
    return <div>Training not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Edit Training</h1>

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

        <Select
          label="Venue"
          name="venueId"
          value={formData.venueId || ''}
          onChange={(e) => setFormData({ ...formData, venueId: parseInt(e.target.value) || undefined })}
          options={[
            { value: '', label: 'Select a venue' },
            ...venues.map((venue: any) => ({
              value: venue.id.toString(),
              label: `${venue.name}${venue.conferenceRoom ? ` - ${venue.conferenceRoom}` : ''}`
            }))
          ]}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="datetime-local"
            label="Training Start Date & Time"
            value={formData.trainingStartDate || ''}
            onChange={(e) => {
              const newStartDate = e.target.value;
              const newDuration = calculateDuration(newStartDate, formData.trainingEndDate);
              setFormData({ 
                ...formData, 
                trainingStartDate: newStartDate,
                duration: newDuration 
              });
            }}
          />

          <Input
            type="datetime-local"
            label="Training End Date & Time"
            value={formData.trainingEndDate || ''}
            onChange={(e) => {
              const newEndDate = e.target.value;
              const newDuration = calculateDuration(formData.trainingStartDate, newEndDate);
              setFormData({ 
                ...formData, 
                trainingEndDate: newEndDate,
                duration: newDuration 
              });
            }}
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
            {loadingTrainers ? (
              <option value="">Loading trainers...</option>
            ) : (
              trainers.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>
                  {`${trainer.name} - ${trainer.type}`}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              type="text"
              label="Duration"
              value={formatDuration(formData.duration)}
              onChange={(e) => {
                const parsedHours = parseDurationToHours(e.target.value);
                setFormData({ 
                  ...formData, 
                  duration: parsedHours !== undefined ? parsedHours : formData.duration 
                });
              }}
              placeholder="e.g., 5 hours and 15 minutes"
            />
            <div className="text-sm text-gray-500 mt-1">
              Enter duration in hours and minutes format
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.categoryId || ''}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {categoryOptions.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Select
          label="Status"
          value={formData.status || 'active'}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'cancelled', label: 'Cancelled' },
            { value: 'completed', label: 'Completed' },
          ]}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/trainings')}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={saving}>
            Update Training
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TrainingEditPage;

