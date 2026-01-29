export interface Assignment {
  id: number;
  trainingId: number;
  assigneeType: 'individual' | 'grade' | 'level' | 'position' | 'dmt' | 'function';
  assigneeId?: string;
  assignedBy: number;
  createdAt?: Date;
  updatedAt?: Date;
  topic?: string;
  venue?: string;
  trainingStartDate?: string;
  trainingEndDate?: string;
  trainer?: string;
  assignedByName?: string;
  recipientCount?: number;
}

export interface AssignmentCreateInput {
  trainingId: number;
  assigneeType: 'individual' | 'grade' | 'level' | 'position' | 'dmt' | 'function';
  assigneeId?: string;
  isMandatory?: boolean;
  notes?: string;
}

export interface AssignmentRecipient {
  id: number;
  assignmentId: number;
  userId: number;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  staffId?: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string;
  function?: string;
  level?: string;
  grade?: string;
  trainingTopic?: string;
  userName?: string;
}

export interface AssignmentRecipientUpdateInput {
  status?: 'pending' | 'completed' | 'cancelled';
  notes?: string;
}

export interface PaginatedAssignmentsResponse {
  assignments: Assignment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

