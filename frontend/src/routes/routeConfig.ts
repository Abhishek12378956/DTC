import React from 'react';
import { ROLES } from '../utils/constants';

export interface RouteConfig {
  path: string;
  component: React.ComponentType | React.LazyExoticComponent<React.ComponentType<any>>;
  requiredRoles?: string[];
  title: string;
}

export const routeConfig: RouteConfig[] = [
  {
    path: '/',
    component: React.lazy(() => import('../pages/dashboard/DashboardPage').then(m => ({ default: m.default }))),
    title: 'Dashboard',
  },
  {
    path: '/trainings',
    component: React.lazy(() => import('../pages/trainings/TrainingsListPage').then(m => ({ default: m.default }))),
    title: 'Trainings',
  },
  {
    path: '/trainings/create',
    component: React.lazy(() => import('../pages/trainings/TrainingCreatePage').then(m => ({ default: m.default }))),
    requiredRoles: [ROLES.ADMIN, ROLES.HR_MANAGER_BCM, ROLES.HR_MANAGER_DHQ],
    title: 'Create Training',
  },
  {
    path: '/trainings/:id',
    component: React.lazy(() => import('../pages/trainings/TrainingDetailsPage').then(m => ({ default: m.default }))),
    title: 'Training Details',
  },
  {
    path: '/assignments',
    component: React.lazy(() => import('../pages/assignments/AssignmentsListPage').then(m => ({ default: m.default }))),
    title: 'Assignments',
  },
  {
    path: '/assignments/create',
    component: React.lazy(() => import('../pages/assignments/AssignmentCreatePage').then(m => ({ default: m.default }))),
    title: 'Create Assignment',
  },
  {
    path: '/assignments/:id/recipients',
    component: React.lazy(() => import('../pages/assignments/AssignmentRecipientsPage').then(m => ({ default: m.default }))),
    title: 'Assignment Recipients',
  },
  {
    path: '/reports',
    component: React.lazy(() => import('../pages/reports/IndividualReportPage').then(m => ({ default: m.default }))),
    title: 'Reports',
  },
  {
    path: '/reports/assigner',
    component: React.lazy(() => import('../pages/reports/AssignerReportPage').then(m => ({ default: m.default }))),
    title: 'Assigner Reports',
  },
  {
    path: '/reports/dmt',
    component: React.lazy(() => import('../pages/reports/DmtReportPage').then(m => ({ default: m.default }))),
    title: 'DMT Reports',
  },
  {
    path: '/master',
    component: React.lazy(() => import('../pages/master/UsersPage').then(m => ({ default: m.default }))),
    title: 'Master Data',
  },
  {
    path: '/master/positions',
    component: React.lazy(() => import('../pages/master/PositionsPage').then(m => ({ default: m.default }))),
    requiredRoles: [ROLES.ADMIN, ROLES.HR_MANAGER_BCM, ROLES.HR_MANAGER_DHQ],
    title: 'Positions',
  },
  {
    path: '/master/ksa',
    component: React.lazy(() => import('../pages/master/KsaPage').then(m => ({ default: m.default }))),
    requiredRoles: [ROLES.ADMIN, ROLES.HR_MANAGER_BCM, ROLES.HR_MANAGER_DHQ],
    title: 'KSA',
  },
  {
    path: '/master/dmt',
    component: React.lazy(() => import('../pages/master/DmtPage').then(m => ({ default: m.default }))),
    requiredRoles: [ROLES.ADMIN, ROLES.HR_MANAGER_BCM, ROLES.HR_MANAGER_DHQ],
    title: 'DMT',
  },
  {
    path: '/users',
    component: React.lazy(() => import('../pages/master/UsersPage').then(m => ({ default: m.default }))),
    requiredRoles: [ROLES.ADMIN, ROLES.HR_MANAGER_BCM, ROLES.HR_MANAGER_DHQ],
    title: 'Users',
  },  
  {
  path: '/users',
  component: React.lazy(() => import('../pages/users/UsersListPage').then(m => ({ default: m.default }))),
  title: 'Users',
  requiredRoles: [ROLES.ADMIN, ROLES.HR_MANAGER_BCM, ROLES.HR_MANAGER_DHQ],
},
{
  path: '/users/create',
  component: React.lazy(() => import('../pages/users/UserCreatePage').then(m => ({ default: m.default }))),
  title: 'Create User',
  requiredRoles: [ROLES.ADMIN, ROLES.HR_MANAGER_BCM, ROLES.HR_MANAGER_DHQ],
},
{
  path: '/users/edit/:id',
  component: React.lazy(() => import('../pages/users/UserEditPage').then(m => ({ default: m.default }))),
  title: 'Edit User',
  requiredRoles: [ROLES.ADMIN, ROLES.HR_MANAGER_BCM, ROLES.HR_MANAGER_DHQ],
},
{
  path: '/users/:id',
  component: React.lazy(() => import('../pages/users/UserDetailsPage').then(m => ({ default: m.default }))),
  title: 'User Details',
  requiredRoles: [ROLES.ADMIN, ROLES.HR_MANAGER_BCM, ROLES.HR_MANAGER_DHQ],
},
  {
    path: '/suggestions',
    component: React.lazy(() => import('../pages/suggestions/SuggestionsPage').then(m => ({ default: m.default }))),
    title: 'Training Suggestions',
  },
];

