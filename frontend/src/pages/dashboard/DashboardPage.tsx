import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { trainingApi } from '../../api/trainingApi';
import { assignmentApi } from '../../api/assignmentApi';
import { reportApi } from '../../api/reportApi';
import { Training } from '../../types/training.types';
import { Assignment } from '../../types/assignment.types';
import  StatCard  from '../../components/widgets/StatCard';
import { Loader } from '../../components/common/Loader';
import { formatDate } from '../../utils/formatDate';
import { useAuth } from '../../hooks/useAuth';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTrainings: 0,
    totalAssignments: 0,
    pendingTrainings: 0,
    completedTrainings: 0,
  });
  const [recentTrainings, setRecentTrainings] = useState<Training[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (loadingRef.current) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      const [trainingsData, assignmentsData, individualReportData] = await Promise.all([
        trainingApi.getAll(),
        assignmentApi.getAll(),
        user ? reportApi.getIndividual(user.id) : Promise.resolve({ reports: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false } }),
      ]);

      const completed = individualReportData.reports.filter((r: any) => r.status === 'completed').length;
      const pending = individualReportData.reports.filter((r: any) => r.status === 'pending').length;
      console.log("hbhdbfhdsbhfsjf", completed, pending );
     
      setStats({
        totalTrainings: trainingsData.data.length,
        totalAssignments: assignmentsData.assignments.length,
        pendingTrainings: pending,
        completedTrainings: completed,
      });

      setRecentTrainings(trainingsData.data.slice(0, 5));
      setRecentAssignments(assignmentsData.assignments.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Trainings"
          value={stats.totalTrainings}
          icon={<span className="text-2xl">📚</span>}
        />
        <StatCard
          title="Total Assignments"
          value={stats.totalAssignments}
          icon={<span className="text-2xl">📋</span>}
        />
        <StatCard
          title="Pending Trainings"
          value={stats.pendingTrainings}
          icon={<span className="text-2xl">⏳</span>}
        />
        <StatCard
          title="Completed Trainings"
          value={stats.completedTrainings}
          icon={<span className="text-2xl">✅</span>}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Trainings</h3>
            <div className="space-y-3">
              {recentTrainings.length === 0 ? (
                <p className="text-gray-500">No trainings yet</p>
              ) : (
                recentTrainings.map((training) => (
                  <div key={training.id} className="border-b pb-3 last:border-0">
                    <Link
                      to={`/trainings/${training.id}`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-800"
                    >
                      {training.topic}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {training.trainingStartDate
                        ? formatDate(training.trainingStartDate)
                        : 'Date TBD'}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Link to="/trainings" className="text-sm text-primary-600 hover:text-primary-800">
                View all trainings →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Assignments</h3>
            <div className="space-y-3">
              {recentAssignments.length === 0 ? (
                <p className="text-gray-500">No assignments yet</p>
              ) : (
                recentAssignments.map((assignment) => (
                  <div key={assignment.id} className="border-b pb-3 last:border-0">
                    <Link
                      to={`/assignments`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-800"
                    >
                      {assignment.topic}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {assignment.recipientCount || 0} recipients • {assignment.assigneeType}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Link to="/assignments" className="text-sm text-primary-600 hover:text-primary-800">
                View all assignments →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

