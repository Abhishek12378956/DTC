import sql from 'mssql';
import bcrypt from 'bcrypt';
import getPool from '../config/db';
import { User, UserCreateInput, UserUpdateInput, PaginatedUsersResponse } from '../models/user.model';

export class UserService {
  async findAll(params?: {
    search?: string;
    roleId?: number;
    dmtId?: number;
    department?: string;
    function?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedUsersResponse> {
    const pool = await getPool();
    let request = pool.request();

    // Set default pagination values
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    
    if (params?.search) {
      whereClause += ` AND (u.firstName LIKE @search OR u.lastName LIKE @search OR u.email LIKE @search OR u.staffId LIKE @search)`;
      request.input('search', sql.NVarChar, `%${params.search}%`);
    }

    if (params?.roleId) {
      whereClause += ` AND u.roleId = @roleId`;
      request.input('roleId', sql.Int, params.roleId);
    }

    if (params?.dmtId) {
      whereClause += ` AND u.dmtId = @dmtId`;
      request.input('dmtId', sql.Int, params.dmtId);
    }

    if (params?.department) {
      whereClause += ` AND u.department = @department`;
      request.input('department', sql.NVarChar, params.department);
    }

    if (params?.function) {
      whereClause += ` AND u.[function] = @function`;
      request.input('function', sql.NVarChar, params.function);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN roles r ON u.roleId = r.id
      LEFT JOIN dmt d ON u.dmtId = d.id
      LEFT JOIN users m ON u.managerId = m.id
      LEFT JOIN positions p ON u.positionId = p.id
      ${whereClause}
    `;

    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;

    // Get paginated data
    const dataQuery = `
      SELECT u.id, u.staffId, u.employeeId, u.firstName, u.lastName, u.email,
             u.department, u.[function] as [function], u.[level] as level, u.grade,
             u.dmtId, d.name as dmtName,
             u.managerId, m.firstName + ' ' + m.lastName as managerName,
             u.positionId, p.title as positionTitle,
             u.roleId, r.name as roleName, u.status
      FROM users u
      LEFT JOIN roles r ON u.roleId = r.id
      LEFT JOIN dmt d ON u.dmtId = d.id
      LEFT JOIN users m ON u.managerId = m.id
      LEFT JOIN positions p ON u.positionId = p.id
      ${whereClause}
      ORDER BY u.firstName, u.lastName
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limit);

    const dataResult = await request.query(dataQuery);
    const users = dataResult.recordset;

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      users,
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

  async findById(id: number): Promise<User | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT u.id, u.staffId, u.employeeId, u.firstName, u.lastName, u.email,
               u.department, u.[function] as [function], u.[level] as level, u.grade,
               u.dmtId, d.name as dmtName,
               u.managerId, m.firstName + ' ' + m.lastName as managerName,
               u.positionId, p.title as positionTitle,
               u.roleId, r.name as roleName, u.status
        FROM users u
        LEFT JOIN roles r ON u.roleId = r.id
        LEFT JOIN dmt d ON u.dmtId = d.id
        LEFT JOIN users m ON u.managerId = m.id
        LEFT JOIN positions p ON u.positionId = p.id
        WHERE u.id = @id
      `);

    return result.recordset[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query(`
        SELECT u.id, u.email, u.passwordHash, u.staffId, u.firstName, u.lastName,
               u.roleId, r.name as roleName
        FROM users u
        INNER JOIN roles r ON u.roleId = r.id
        WHERE u.email = @email AND u.status = 'active'
      `);

    return result.recordset[0] || null;
  }

  async findByEmployeeId(employeeId: string): Promise<User | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('employeeId', sql.NVarChar, employeeId)
      .query(`
        SELECT id, employeeId
        FROM users
        WHERE employeeId = @employeeId AND status = 'active'
      `);

    return result.recordset[0] || null;
  }

  async create(input: UserCreateInput): Promise<User> {
    const passwordHash = await bcrypt.hash(input.password, 10);
    const pool = await getPool();

    const result = await pool
      .request()
      .input('staffId', sql.NVarChar, input.staffId)
      .input('employeeId', sql.NVarChar, input.employeeId || null)
      .input('firstName', sql.NVarChar, input.firstName)
      .input('lastName', sql.NVarChar, input.lastName || null)
      .input('email', sql.NVarChar, input.email)
      .input('passwordHash', sql.NVarChar, passwordHash)
      .input('department', sql.NVarChar, input.department || null)
      .input('function', sql.NVarChar, input.function || null)
      .input('level', sql.NVarChar, input.level || null)
      .input('grade', sql.NVarChar, input.grade || null)
      .input('dmtId', sql.Int, input.dmtId || null)
      .input('managerId', sql.Int, input.managerId || null)
      .input('positionId', sql.Int, input.positionId || null)
      .input('roleId', sql.Int, input.roleId)
      .query(`
        INSERT INTO users (staffId, employeeId, firstName, lastName, email, passwordHash,
                          department, [function], [level], grade, dmtId, managerId, positionId, roleId)
        OUTPUT INSERTED.id, INSERTED.staffId, INSERTED.email, INSERTED.firstName, INSERTED.lastName
        VALUES (@staffId, @employeeId, @firstName, @lastName, @email, @passwordHash,
                @department, @function, @level, @grade, @dmtId, @managerId, @positionId, @roleId)
      `);

    return result.recordset[0];
  }

  async update(id: number, input: UserUpdateInput): Promise<User> {
    const pool = await getPool();
    let request = pool.request().input('id', sql.Int, id);

    const updates: string[] = [];
    if (input.staffId !== undefined) {
      updates.push('staffId = @staffId');
      request.input('staffId', sql.NVarChar, input.staffId);
    }
    if (input.employeeId !== undefined) {
      updates.push('employeeId = @employeeId');
      request.input('employeeId', sql.NVarChar, input.employeeId);
    }
    if (input.firstName !== undefined) {
      updates.push('firstName = @firstName');
      request.input('firstName', sql.NVarChar, input.firstName);
    }
    if (input.lastName !== undefined) {
      updates.push('lastName = @lastName');
      request.input('lastName', sql.NVarChar, input.lastName);
    }
    if (input.email !== undefined) {
      updates.push('email = @email');
      request.input('email', sql.NVarChar, input.email);
    }
    if (input.password) {
      const passwordHash = await bcrypt.hash(input.password, 10);
      updates.push('passwordHash = @passwordHash');
      request.input('passwordHash', sql.NVarChar, passwordHash);
    }
    if (input.department !== undefined) {
      updates.push('department = @department');
      request.input('department', sql.NVarChar, input.department);
    }
    if (input.function !== undefined) {
      updates.push('[function] = @function');
      request.input('function', sql.NVarChar, input.function);
    }
    if (input.level !== undefined) {
      updates.push('[level] = @level');
      request.input('level', sql.NVarChar, input.level);
    }
    if (input.grade !== undefined) {
      updates.push('grade = @grade');
      request.input('grade', sql.NVarChar, input.grade);
    }
    if (input.dmtId !== undefined) {
      updates.push('dmtId = @dmtId');
      request.input('dmtId', sql.Int, input.dmtId);
    }
    if (input.managerId !== undefined) {
      updates.push('managerId = @managerId');
      request.input('managerId', sql.Int, input.managerId);
    }
    if (input.positionId !== undefined) {
      updates.push('positionId = @positionId');
      request.input('positionId', sql.Int, input.positionId);
    }
    if (input.roleId !== undefined) {
      updates.push('roleId = @roleId');
      request.input('roleId', sql.Int, input.roleId);
    }
    if (input.status !== undefined) {
      updates.push('status = @status');
      request.input('status', sql.NVarChar, input.status);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push('updatedAt = SYSUTCDATETIME()');

    await request.query(`UPDATE users SET ${updates.join(', ')} WHERE id = @id`);

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('User not found after update');
    }

    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM users WHERE id = @id');

    return result.rowsAffected[0] > 0;
  }
}

export default new UserService();

