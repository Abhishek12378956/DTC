export interface IndividualReport {
  id: number;
  topic: string;
  venue?: string;
  trainingStartDate?: string;
  trainingEndDate?: string;
  trainer?: string;
  status: string;
  notes?: string;
  assignedByName?: string;
  assignedDate?: string;
}

export interface AssignerReport {
  assignmentId: number;
  topic: string;
  venue?: string;
  trainingStartDate?: string;
  trainingEndDate?: string;
  trainer?: string;
  assigneeType: string;
  assigneeId?: string;
  assignedDate?: string;
  totalRecipients: number;
  completedCount: number;
  pendingCount: number;
}

export interface DMTReport {
  dmtId: number;
  dmtName: string;
  topic: string;
  venue?: string;
  trainingStartDate?: string;
  trainingEndDate?: string;
  trainer?: string;
  totalMembers: number;
  completedCount: number;
  pendingCount: number;
}

export interface PaginatedIndividualReportsResponse {
  reports: IndividualReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginatedAssignerReportsResponse {
  reports: AssignerReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginatedDMTReportsResponse {
  reports: DMTReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

