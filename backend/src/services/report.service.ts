import sql from 'mssql';
import getPool from '../config/db';

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
  totalRecipients?: number;
  completedCount?: number;
  pendingCount?: number;
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

export class ReportService {
  async getIndividualReport(userId: number, params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedIndividualReportsResponse> {
  const pool = await getPool();
  let request = pool.request();

  // Set default pagination values
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const offset = (page - 1) * limit;

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM assignment_recipients ar
    INNER JOIN assignments a ON ar.assignmentId = a.id
    INNER JOIN trainings t ON a.trainingId = t.id
    LEFT JOIN users u ON a.assignedBy = u.id
    WHERE ar.userId = @userId
  `;

  request.input('userId', sql.Int, userId);
  const countResult = await request.query(countQuery);
  const total = countResult.recordset[0].total;

  // Get paginated data
  const dataQuery = `
    SELECT 
      ar.id,
      t.topic,
      v.name as venue,
      t.trainingStartDate,
      t.trainingEndDate,
      tr.trainerName as trainer,
      ar.status,
      ar.notes,
      u.firstName + ' ' + u.lastName as assignedByName,
      a.createdAt as assignedDate
    FROM assignment_recipients ar
    INNER JOIN assignments a ON ar.assignmentId = a.id
    INNER JOIN trainings t ON a.trainingId = t.id
    LEFT JOIN venues v ON t.venueId = v.id
    LEFT JOIN trainers tr ON t.trainerId = tr.id
    LEFT JOIN users u ON a.assignedBy = u.id
    WHERE ar.userId = @userId
    ORDER BY t.trainingStartDate DESC, a.createdAt DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `;

  request.input("offset", sql.Int, offset);
  request.input("limit", sql.Int, limit);

  const dataResult = await request.query(dataQuery);
  const reports = dataResult.recordset;

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    reports,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
}

  async getAssignerReport(assignerId: number, params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedAssignerReportsResponse> {
  const pool = await getPool();
  let request = pool.request();

  // Set default pagination values
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const offset = (page - 1) * limit;

  // Get total count
  const countQuery = `
    SELECT COUNT(DISTINCT a.id) as total
    FROM assignments a
    INNER JOIN trainings t ON a.trainingId = t.id
    LEFT JOIN assignment_recipients ar ON a.id = ar.assignmentId
    WHERE a.assignedBy = @assignerId
  `;

  request.input('assignerId', sql.Int, assignerId);
  const countResult = await request.query(countQuery);
  const total = countResult.recordset[0].total;

  // Get paginated data
  const dataQuery = `
    SELECT 
      a.id as assignmentId,
      t.topic,
      v.name as venue,
      t.trainingStartDate,
      t.trainingEndDate,
      tr.trainerName as trainer,
      a.assigneeType,
      a.assigneeId,
      a.createdAt as assignedDate,
      COUNT(ar.id) as totalRecipients,
      SUM(CASE WHEN ar.status = 'completed' THEN 1 ELSE 0 END) as completedCount,
      SUM(CASE WHEN ar.status = 'pending' THEN 1 ELSE 0 END) as pendingCount
    FROM assignments a
    INNER JOIN trainings t ON a.trainingId = t.id
    LEFT JOIN venues v ON t.venueId = v.id
    LEFT JOIN trainers tr ON t.trainerId = tr.id
    LEFT JOIN assignment_recipients ar ON a.id = ar.assignmentId
    WHERE a.assignedBy = @assignerId
    GROUP BY a.id, t.topic, v.name, t.trainingStartDate, t.trainingEndDate, tr.trainerName,
             a.assigneeType, a.assigneeId, a.createdAt
    ORDER BY a.createdAt DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `;

  request.input("offset", sql.Int, offset);
  request.input("limit", sql.Int, limit);

  const dataResult = await request.query(dataQuery);
  const reports = dataResult.recordset;

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    reports,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
}

  async getDMTReport(dmtId?: number, params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedDMTReportsResponse> {
  const pool = await getPool();
  let request = pool.request();

  // Set default pagination values
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const offset = (page - 1) * limit;

  // Build WHERE clause
  let whereClause = 'WHERE 1=1';
  if (dmtId) {
    whereClause += ` AND d.id = @dmtId`;
    request.input('dmtId', sql.Int, dmtId);
  }

  // Get total count
  const countQuery = `
    SELECT COUNT(DISTINCT d.id) as total
    FROM dmt d
    INNER JOIN users u ON d.id = u.dmtId
    INNER JOIN assignment_recipients ar ON u.id = ar.userId
    INNER JOIN assignments a ON ar.assignmentId = a.id
    INNER JOIN trainings t ON a.trainingId = t.id
    ${whereClause}
  `;

  const countResult = await request.query(countQuery);
  const total = countResult.recordset[0].total;

  // Get paginated data
  const dataQuery = `
    SELECT 
      d.id as dmtId,
      d.name as dmtName,
      t.topic,
      v.name as venue,
      t.trainingStartDate,
      t.trainingEndDate,
      tr.trainerName as trainer,
      COUNT(DISTINCT ar.userId) as totalMembers,
      SUM(CASE WHEN ar.status = 'completed' THEN 1 ELSE 0 END) as completedCount,
      SUM(CASE WHEN ar.status = 'pending' THEN 1 ELSE 0 END) as pendingCount
    FROM dmt d
    INNER JOIN users u ON d.id = u.dmtId
    INNER JOIN assignment_recipients ar ON u.id = ar.userId
    INNER JOIN assignments a ON ar.assignmentId = a.id
    INNER JOIN trainings t ON a.trainingId = t.id
    LEFT JOIN venues v ON t.venueId = v.id
    LEFT JOIN trainers tr ON t.trainerId = tr.id
    ${whereClause}
    GROUP BY d.id, d.name, t.topic, v.name, t.trainingStartDate, t.trainingEndDate, tr.trainerName
    ORDER BY t.trainingStartDate DESC, d.name
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `;

  request.input("offset", sql.Int, offset);
  request.input("limit", sql.Int, limit);

  const dataResult = await request.query(dataQuery);
  const reports = dataResult.recordset;

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    reports,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
}

  async exportReport(type: 'individual' | 'assigner' | 'dmt', id?: number): Promise<any[]> {
    const pool = await getPool();
    let query = '';
    let request = pool.request();

    switch (type) {
      case 'individual':
        query = `
          SELECT 
            u.staffId,
            u.employeeId,
            u.firstName + ' ' + u.lastName as fullName,
            u.email,
            u.department,
            u.[function] as [function],
            u.[level] as level,
            u.grade,
            t.topic,
            v.name as venue,
            t.trainingStartDate,
            t.trainingEndDate,
            tr.trainerName as trainer,
            ar.status
          FROM assignment_recipients ar
          INNER JOIN assignments a ON ar.assignmentId = a.id
          INNER JOIN trainings t ON a.trainingId = t.id
          LEFT JOIN venues v ON t.venueId = v.id
          LEFT JOIN trainers tr ON t.trainerId = tr.id
          INNER JOIN users u ON ar.userId = u.id
          WHERE ar.userId = @id
          ORDER BY t.trainingStartDate DESC
        `;
        request.input('id', sql.Int, id);
        break;

      case 'assigner':
        query = `
          SELECT 
            t.topic,
            v.name as venue,
            t.trainingStartDate,
            t.trainingEndDate,
            tr.trainerName as trainer,
            a.assigneeType,
            a.assigneeId,
            u.staffId,
            u.employeeId,
            u.firstName + ' ' + u.lastName as fullName,
            ar.status
          FROM assignments a
          INNER JOIN trainings t ON a.trainingId = t.id
          LEFT JOIN venues v ON t.venueId = v.id
          LEFT JOIN trainers tr ON t.trainerId = tr.id
          INNER JOIN assignment_recipients ar ON a.id = ar.assignmentId
          INNER JOIN users u ON ar.userId = u.id
          WHERE a.assignedBy = @id
          ORDER BY t.trainingStartDate DESC, u.firstName, u.lastName
        `;
        request.input('id', sql.Int, id);
        break;

      case 'dmt':
        query = `
          SELECT 
            d.name as dmtName,
            u.staffId,
            u.employeeId,
            u.firstName + ' ' + u.lastName as fullName,
            u.email,
            t.topic,
            v.name as venue,
            t.trainingStartDate,
            t.trainingEndDate,
            tr.trainerName as trainer,
            ar.status
          FROM dmt d
          INNER JOIN users u ON d.id = u.dmtId
          INNER JOIN assignment_recipients ar ON u.id = ar.userId
          INNER JOIN assignments a ON ar.assignmentId = a.id
          INNER JOIN trainings t ON a.trainingId = t.id
          LEFT JOIN venues v ON t.venueId = v.id
          LEFT JOIN trainers tr ON t.trainerId = tr.id
          WHERE d.id = @id
          ORDER BY t.trainingStartDate DESC, u.firstName, u.lastName
        `;
        request.input('id', sql.Int, id);
        break;

      default:
        throw new Error('Invalid export type');
    }

    const result = await request.query(query);
    return result.recordset;
  }
}

export default new ReportService();

