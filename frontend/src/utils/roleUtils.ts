import { ROLES } from './constants';

export const canAssignTraining = (roleName: string): boolean => {
  return [
    ROLES.ADMIN,
    ROLES.HR_MANAGER_BCM,
    ROLES.HR_MANAGER_DHQ,
    ROLES.PCOE,
    ROLES.ICOE,
    ROLES.BE_CELL_MANAGER,
    ROLES.LND,
    ROLES.DMT_LEADER,
    ROLES.FUNCTIONAL_HEAD,
    ROLES.MANAGER,
    ROLES.ESP,
    ROLES.EMPLOYEE,
  ].includes(roleName as any);
};

export const canManageMasters = (roleName: string): boolean => {
  return [
    ROLES.ADMIN,
    ROLES.HR_MANAGER_BCM,
    ROLES.HR_MANAGER_DHQ,
  ].includes(roleName as any);
};

export const canViewAllReports = (roleName: string): boolean => {
  return [
    ROLES.ADMIN,
    ROLES.HR_MANAGER_BCM,
    ROLES.HR_MANAGER_DHQ,
    ROLES.PCOE,
    ROLES.ICOE,
    ROLES.BE_CELL_MANAGER,
    ROLES.LND,
    ROLES.DMT_LEADER,
  ].includes(roleName as any);
};

export const canSelfAssign = (roleName: string): boolean => {
  return [
    ROLES.MANAGER,
    ROLES.ESP,
    ROLES.EMPLOYEE,
  ].includes(roleName as any);
};

export const canManageUsers = (roleName: string): boolean => {
  return [
    ROLES.ADMIN,
    ROLES.HR_MANAGER_BCM,
    ROLES.HR_MANAGER_DHQ,
  ].includes(roleName as any);
};

