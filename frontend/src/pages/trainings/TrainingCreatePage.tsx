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

  const [dateFields, setDateFields] = useState({
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: ''
  });

  const [selectedDuration, setSelectedDuration] = useState<number>(1); // in hours
  const [calculatedDuration, setCalculatedDuration] = useState<number>(0); // in minutes

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

  // Combine date and time fields to form datetime strings
  useEffect(() => {
    const startDateTime = dateFields.startDate && dateFields.startTime 
      ? `${dateFields.startDate}T${dateFields.startTime}`
      : dateFields.startDate ? `${dateFields.startDate}T00:00:00` // Default to midnight if no time
      : '';
    const endDateTime = dateFields.endDate && dateFields.endTime 
      ? `${dateFields.endDate}T${dateFields.endTime}`
      : dateFields.endDate ? `${dateFields.endDate}T23:59:59` // Default to end of day if no time
      : '';

    setFormData(prev => ({
      ...prev,
      trainingStartDate: startDateTime,
      trainingEndDate: endDateTime
    }));
  }, [dateFields]);

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

  // Determine if training is single-day, multi-day, or no dates selected
  const hasDates = dateFields.startDate !== '' && dateFields.endDate !== '';
  const isSingleDay = hasDates && dateFields.startDate === dateFields.endDate;

  // Calculate duration for single-day trainings only
  useEffect(() => {
    if (isSingleDay && dateFields.startTime && dateFields.endTime && formData.trainingStartDate && formData.trainingEndDate) {
      const startDateTime = new Date(formData.trainingStartDate);
      const endDateTime = new Date(formData.trainingEndDate);

      if (!isNaN(startDateTime.getTime()) && !isNaN(endDateTime.getTime())) {
        const diffInMs = endDateTime.getTime() - startDateTime.getTime();
        const diffInMinutes = Math.max(0, diffInMs / (1000 * 60));
        const calculatedMinutes = Math.floor(diffInMinutes);
        setCalculatedDuration(calculatedMinutes);
        setFormData(prev => ({ ...prev, duration: calculatedMinutes }));
      }
    } else if (isSingleDay) {
      // Reset duration for single-day if times are not selected
      setCalculatedDuration(0);
      setFormData(prev => ({ ...prev, duration: undefined }));
    } else {
      setCalculatedDuration(0);
    }
  }, [formData.trainingStartDate, formData.trainingEndDate, isSingleDay, dateFields.startTime, dateFields.endTime]);

  // Handle multi-day duration separately
  useEffect(() => {
    if (!isSingleDay && selectedDuration > 0) {
      const durationInMinutes = selectedDuration * 60; // Convert hours to minutes
      setFormData(prev => ({ ...prev, duration: durationInMinutes }));
    }
  }, [selectedDuration, isSingleDay]);

  // Update duration mode when dates change
  useEffect(() => {
    if (isSingleDay) {
      // Reset selected duration when switching to single-day
      setSelectedDuration(1);
    }
  }, [isSingleDay]);

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

  const handleDateTimeChange = (field: string, value: string) => {
    // Validate time constraints
    if (field === 'startTime' && value) {
      const [hours, minutes] = value.split(':').map(Number);
      
      // Strict validation for business hours - no times after 6 PM
      if (hours > 18 || (hours === 18 && minutes > 0)) {
        showToast('Start time must be 6:00 PM or earlier', 'error');
        // Clear the invalid time
        setDateFields(prev => ({ ...prev, startTime: '' }));
        return;
      }
      
      if (hours < 9) {
        showToast('Start time must be 9:00 AM or later', 'error');
        // Clear the invalid time
        setDateFields(prev => ({ ...prev, startTime: '' }));
        return;
      }
      
      // If end time is already selected and is before new start time, clear it
      if (dateFields.endTime) {
        const [endHours, endMinutes] = dateFields.endTime.split(':').map(Number);
        if (hours > endHours || (hours === endHours && minutes > endMinutes)) {
          setDateFields(prev => ({ ...prev, endTime: '' }));
          showToast('End time cleared as it was before the new start time', 'info');
        }
      }
    }
    
    if (field === 'endTime' && value) {
      const [hours, minutes] = value.split(':').map(Number);
      
      // Strict validation for business hours - no times after 6 PM
      if (hours > 18 || (hours === 18 && minutes > 0)) {
        showToast('End time must be 6:00 PM or earlier', 'error');
        // Clear the invalid time
        setDateFields(prev => ({ ...prev, endTime: '' }));
        return;
      }
      
      if (hours < 9) {
        showToast('End time must be 9:00 AM or later', 'error');
        // Clear the invalid time
        setDateFields(prev => ({ ...prev, endTime: '' }));
        return;
      }
      
      // Validate that end time is after start time
      if (dateFields.startTime) {
        const [startHours, startMinutes] = dateFields.startTime.split(':').map(Number);
        if (hours < startHours || (hours === startHours && minutes <= startMinutes)) {
          showToast('End time must be after start time', 'error');
          // Clear the invalid time
          setDateFields(prev => ({ ...prev, endTime: '' }));
          return;
        }
      }
    }
    
    setDateFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Generate duration options for multi-day trainings
  const durationOptions = Array.from({ length: 16 }, (_, i) => {
    const hours = 0.5 + (i * 0.5);
    return {
      value: hours,
      label: hours === Math.floor(hours) ? `${hours} hours` : `${hours} hours`
    };
  });

  // Format duration display
  const formatDuration = (minutes: number) => {
    if (!minutes) return '';
    
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.floor(minutes % 60);
      return remainingMinutes > 0 ? `${hours} hours ${remainingMinutes} minutes` : `${hours} hours`;
    } else {
      return `${minutes} minutes`;
    }
  };

  // Constants for duration conversion
  const MINUTES_PER_HOUR = 60;

  const handleDurationChange = (hours: number) => {
    setSelectedDuration(hours);
    if (!isSingleDay) {
      const durationInMinutes = hours * MINUTES_PER_HOUR;
      setFormData(prev => ({ ...prev, duration: durationInMinutes }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.trainingStartDate || !formData.trainingEndDate) {
      showToast('Please select training start and end dates', 'error');
      return;
    }

    // For single-day training, times are required
    if (isSingleDay && (!dateFields.startTime || !dateFields.endTime)) {
      showToast('Please select both start and end times for single-day training', 'error');
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

    // Validation for duration
    if (!isSingleDay && (!selectedDuration || selectedDuration <= 0)) {
      showToast('Please select a valid daily duration for multi-day training', 'error');
      return;
    }

    if (isSingleDay && (!calculatedDuration || calculatedDuration <= 0)) {
      showToast('Please ensure end time is after start time for single-day training', 'error');
      return;
    }

    // Time validation only for single-day training
    if (isSingleDay) {
      const startDateTime = new Date(formData.trainingStartDate);
      const endDateTime = new Date(formData.trainingEndDate);
      
      if (endDateTime <= startDateTime) {
        showToast('End time must be after start time for single-day training', 'error');
        return;
      }
      
      // Validate business hours for single-day training
      const startHour = startDateTime.getHours();
      const endHour = endDateTime.getHours();
      
      if (startHour < 9 || startHour >= 18) {
        showToast('Start time must be between 9:00 AM and 6:00 PM', 'error');
        return;
      }
      
      if (endHour < 9 || endHour > 18) {
        showToast('End time must be between 9:00 AM and 6:00 PM', 'error');
        return;
      }
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
          <div>
            <Input
              type="date"
              label="Training Start Date *"
              value={dateFields.startDate}
              onChange={(e) => handleDateTimeChange('startDate', e.target.value)}
              min={nowLocal.split('T')[0]}
            />
            <Input
              type="time"
              label={`Training Start Time ${isSingleDay ? '*' : '(Optional)'}`}
              value={dateFields.startTime}
              onChange={(e) => handleDateTimeChange('startTime', e.target.value)}
              className="mt-2"
              required={isSingleDay}
              min="09:00"
              max="18:00"
            />
            <p className="text-sm text-gray-500 mt-1">
              {isSingleDay ? 'Required for single-day training' : 'Optional for multi-day training'}
            </p>
          </div>

          <div>
            <Input
              type="date"
              label="Training End Date *"
              value={dateFields.endDate}
              onChange={(e) => handleDateTimeChange('endDate', e.target.value)}
              min={dateFields.startDate || nowLocal.split('T')[0]}
            />
            <Input
              type="time"
              label={`Training End Time ${isSingleDay ? '*' : '(Optional)'}`}
              value={dateFields.endTime}
              onChange={(e) => handleDateTimeChange('endTime', e.target.value)}
              className="mt-2"
              required={isSingleDay}
              min={dateFields.startTime || "09:00"}
              max="18:00"
            />
            <p className="text-sm text-gray-500 mt-1">
              {isSingleDay ? 'Required for single-day training' : 'Optional for multi-day training'}
            </p>
          </div>
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
            {!hasDates ? (
              <>
                <Input
                  type="text"
                  label="Duration"
                  value=""
                  readOnly
                  className="bg-gray-50"
                  placeholder="Please select dates first"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Duration will be available after selecting dates
                </p>
              </>
            ) : isSingleDay ? (
              <>
                <Input
                  type="text"
                  label="Duration"
                  value={formatDuration(calculatedDuration)}
                  readOnly
                  className="bg-gray-50"
                  placeholder="Auto-calculated from dates"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Automatically calculated based on start/end time
                </p>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Duration *
                  </label>
                  <select
                    value={selectedDuration}
                    onChange={(e) => handleDurationChange(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {durationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Daily training hours (same for all training days)
                  </p>
                </div>
              </>
            )}
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
            {!hasDates 
              ? "Please select training dates to determine type" 
              : isSingleDay 
                ? "Single Day Training - Duration auto-calculated from time range" 
                : "Multi-Day Training - Duration selected independently of time range"}
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

