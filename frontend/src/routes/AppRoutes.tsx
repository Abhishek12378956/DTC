import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { Loader } from '../components/common/Loader';

// Lazy load pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage').then(m => ({ default: m.default })));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage').then(m => ({ default: m.default })));

// Training pages
const TrainingsListPage = lazy(() => import('../pages/trainings/TrainingsListPage').then(m => ({ default: m.default })));
const TrainingCreatePage = lazy(() => import('../pages/trainings/TrainingCreatePage').then(m => ({ default: m.default })));
const TrainingDetailsPage = lazy(() => import('../pages/trainings/TrainingDetailsPage').then(m => ({ default: m.default })));
const TrainingEditPage = lazy(() => import('../pages/trainings/TrainingEditPage').then(m => ({ default: m.default })));

// Assignment pages
const AssignmentsListPage = lazy(() => import('../pages/assignments/AssignmentsListPage').then(m => ({ default: m.default })));
const AssignmentCreatePage = lazy(() => import('../pages/assignments/AssignmentCreatePage').then(m => ({ default: m.default })));
const AssignmentRecipientsPage = lazy(() => import('../pages/assignments/AssignmentRecipientsPage').then(m => ({ default: m.default })));

// User management pages
const UserCreatePage = lazy(() => import('../pages/users/UserCreatePage').then(m => ({ default: m.default })));
const UserEditPage = lazy(() => import('../pages/users/UserEditPage').then(m => ({ default: m.default })));
const UsersPage = lazy(() => import('../pages/users/UsersListPage').then(m => ({ default: m.default })));

// Report pages
const IndividualReportPage = lazy(() => import('../pages/reports/IndividualReportPage').then(m => ({ default: m.default })));
const AssignerReportPage = lazy(() => import('../pages/reports/AssignerReportPage').then(m => ({ default: m.default })));
const DmtReportPage = lazy(() => import('../pages/reports/DmtReportPage').then(m => ({ default: m.default })));
const ReportExportPage = lazy(() => import('../pages/reports/ReportExportPage').then(m => ({ default: m.default })));

// Master pages
// const MasterUsersPage = lazy(() => import('../pages/master/UsersPage').then(m => ({ default: m.default })));
const PositionsPage = lazy(() => import('../pages/master/PositionsPage').then(m => ({ default: m.default })));
const KsaPage = lazy(() => import('../pages/master/KsaPage').then(m => ({ default: m.default })));
const DmtPage = lazy(() => import('../pages/master/DmtPage').then(m => ({ default: m.default })));
const CategoryPage = lazy(() => import('../pages/master/CategoryPage').then(m => ({ default: m.default })));
const VenuePage = lazy(() => import('../pages/master/VenuePage').then(m => ({ default: m.default })));
const TrainerPage = lazy(() => import('../pages/master/TrainerPage').then(m => ({ default: m.default })));

// Suggestions page
const SuggestionsPage = lazy(() => import('../pages/suggestions/SuggestionsPage').then(m => ({ default: m.default })));

// Not found page
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then(m => ({ default: m.default })));

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loader fullScreen />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />

          {/* Training routes */}
          <Route path="trainings" element={<TrainingsListPage />} />
          <Route path="trainings/create" element={<TrainingCreatePage />} />
          <Route path="trainings/:id/edit" element={<TrainingEditPage />} />
          <Route path="trainings/:id" element={<TrainingDetailsPage />} />

          {/* Assignment routes */}
          <Route path="assignments" element={<AssignmentsListPage />} />
          <Route path="assignments/create" element={<AssignmentCreatePage />} />
          <Route path="assignments/:id/recipients" element={<AssignmentRecipientsPage />} />

          {/* Report routes */}
          <Route path="reports/individual" element={<IndividualReportPage />} />
          <Route path="reports/assigner" element={<AssignerReportPage />} />
          <Route path="reports/dmt" element={<DmtReportPage />} />
          <Route path="reports/export" element={<ReportExportPage />} />

          {/* Master data routes */}
          <Route path="master" element={<Navigate to="/master/users" replace />} />
          <Route path="master/users" element={<UsersPage />} />
          <Route path="master/users/create" element={<UserCreatePage />} />
          <Route path="master/users/edit/:id" element={<UserEditPage />} />
          <Route path="master/positions" element={<PositionsPage />} />
          <Route path="master/ksa" element={<KsaPage />} />
          <Route path="master/dmt" element={<DmtPage />} />
          <Route path="master/categories" element={<CategoryPage />} />
          <Route path="master/venues" element={<VenuePage />} />
          <Route path="master/trainers" element={<TrainerPage />} />





          {/* Suggestions route */}
          <Route path="suggestions" element={<SuggestionsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
