import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trainingApi } from '../../api/trainingApi';
import { Training } from '../../types/training.types';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { formatDate, formatTime } from '../../utils/formatDate';
import { useToast } from '../../context/ToastContext';

const TrainingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [training, setTraining] = useState<Training | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadTraining();
    }
  }, [id]);

  const loadTraining = async () => {
    try {
      setLoading(true);
      const data = await trainingApi.getById(parseInt(id!));
      setTraining(data);
    } catch (error) {
      showToast('Failed to load training', 'error');
      navigate('/trainings');
    } finally {
      setLoading(false);
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{training.topic}</h1>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/trainings')}>
            Back
          </Button>
          <Button onClick={() => navigate(`/trainings/${id}/edit`)}>
            Edit
          </Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="text-sm text-gray-900">{training.description || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Venue</p>
            <p className="text-sm text-gray-900">
              {typeof training.venue === 'object' ? training.venue.name : training.venue || '-'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Training Date</p>
            <p className="text-sm text-gray-900">
              {training.trainingStartDate ? formatDate(training.trainingStartDate) : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Training Time</p>
            <p className="text-sm text-gray-900">
              {training.trainingStartDate ? formatTime(training.trainingStartDate) : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Trainer/Faculty</p>
            <p className="text-sm text-gray-900">{training.trainerId || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Duration</p>
            <p className="text-sm text-gray-900">{training.duration ? `${training.duration} hours` : '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Category</p>
            <p className="text-sm text-gray-900">{training.category?.name || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                training.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {training.status || 'active'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingDetailsPage;

