export interface User {
  id?: number;
  staffId: string;
  employeeId?: string;
  firstName: string;
  lastName?: string;
  email: string;
  passwordHash?: string;
  password?: string;
  department?: string;
  function?: string;
  level?: string;
  grade?: string;
  dmtId?: number;
  managerId?: number;
  positionId?: number;
  roleId: number;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Joined fields
  dmtName?: string;
  managerName?: string;
  positionTitle?: string;
  roleName?: string;
}

export interface UserCreateInput {
  staffId: string;
  employeeId?: string;
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  department?: string;
  function?: string;
  level?: string;
  grade?: string;
  dmtId?: number;
  managerId?: number;
  positionId?: number;
  roleId: number;
}

export interface UserUpdateInput {
  staffId?: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  department?: string;
  function?: string;
  level?: string;
  grade?: string;
  dmtId?: number;
  managerId?: number;
  positionId?: number;
  roleId?: number;
  status?: string;
}

export interface PaginatedUsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

