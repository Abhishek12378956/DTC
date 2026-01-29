import { useAuth } from './useAuth';
import { canAssignTraining, canManageMasters, canManageUsers, canViewAllReports, canSelfAssign } from '../utils/roleUtils';

export const useRole = () => {
  const { user } = useAuth();

  return {
    canAssignTraining: user ? canAssignTraining(user.roleName || '') : false,
    canManageUsers: user ? canManageUsers(user.roleName || '') : false,
    canManageMasters: user ? canManageMasters(user.roleName || '') : false,
    canViewAllReports: user ? canViewAllReports(user.roleName || '') : false,
    canSelfAssign: user ? canSelfAssign(user.roleName || '') : false,
    isAdmin: user?.roleName === 'Admin',
    roleName: user?.roleName || '',
  };
};

