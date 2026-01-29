export const ROLES = {
  ADMIN: 'Admin',
  HR_MANAGER_BCM: 'HR Manager BCM',
  HR_MANAGER_DHQ: 'HR Manager DHQ',
  PCOE: 'PCOE',
  ICOE: 'ICOE',
  BE_CELL_MANAGER: 'BE Cell Manager',
  LND: 'L&D',
  DMT_LEADER: 'DMT Leader',
  FUNCTIONAL_HEAD: 'Functional Head',
  MANAGER: 'Manager',
  ESP: 'ESP',
  EMPLOYEE: 'Employee',
} as const;

export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const ASSIGNEE_TYPES = {
  INDIVIDUAL: 'individual',
  GRADE: 'grade',
  LEVEL: 'level',
  POSITION: 'position',
  DMT: 'dmt',
  FUNCTION: 'function',
} as const;

