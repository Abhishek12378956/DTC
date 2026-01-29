import React, { useEffect, useState } from 'react';
import { suggestionApi, TrainingSuggestion } from '../../api/suggestionApi';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import DataTable, { Column } from '../../components/tables/DataTable';

const SuggestionsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [suggestions, setSuggestions] = useState<TrainingSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadSuggestions();
    }
  }, [user]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const data = await suggestionApi.getSuggestions(user!.id!);
      setSuggestions(data);
    } catch (error) {
      showToast('Failed to load suggestions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = (suggestion: TrainingSuggestion) => {
    navigate(`/assignments/create?trainingId=${suggestion.trainingId}`);
  };

  const columns: Column<TrainingSuggestion>[] = [
    { key: 'topic', header: 'Training Topic' },
    { key: 'reason', header: 'Reason' },
    {
      key: 'priority',
      header: 'Priority',
      render: (value) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            value === 'high'
              ? 'bg-red-100 text-red-800'
              : value === 'medium'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {value}
        </span>
      ),
    },
    { key: 'ksaGap', header: 'KSA Gap' },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, suggestion) => (
        <Button size="sm" onClick={() => handleAssign(suggestion)}>
          Assign Training
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Training Suggestions</h1>
        <p className="text-sm text-gray-600">
          Based on your knowledge gaps and appraisal data
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <Loader />
        ) : (
          <DataTable
            columns={columns}
            data={suggestions}
            emptyMessage="No training suggestions available at this time"
          />
        )}
      </div>
    </div>
  );
};

export default SuggestionsPage;

