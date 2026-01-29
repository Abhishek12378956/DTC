import sql from 'mssql';
import getPool from '../config/db';
import { Department, DepartmentCreateInput, DepartmentUpdateInput } from '../models/department.model';

export class DepartmentService {
  async findAll(): Promise<Department[]> {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT id, name, description 
      FROM department 
      ORDER BY name
    `);
    return result.recordset;
  }

  async findById(id: number): Promise<Department | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT id, name, description FROM department WHERE id = @id');
    
    return result.recordset[0] || null;
  }

  async create(input: DepartmentCreateInput): Promise<Department> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('name', sql.NVarChar, input.name)
      .input('description', sql.NVarChar, input.description || null)
      .query(`
        INSERT INTO department (name, description)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.description
        VALUES (@name, @description)
      `);

    return result.recordset[0];
  }

  async update(id: number, input: DepartmentUpdateInput): Promise<Department> {
    const pool = await getPool();
    const updates: string[] = [];
    const request = pool.request().input('id', sql.Int, id);

    if (input.name !== undefined) {
      updates.push('name = @name');
      request.input('name', sql.NVarChar, input.name);
    }
    if (input.description !== undefined) {
      updates.push('description = @description');
      request.input('description', sql.NVarChar, input.description);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE department 
      SET ${updates.join(', ')}
      OUTPUT INSERTED.id, INSERTED.name, INSERTED.description
      WHERE id = @id
    `;

    const result = await request.query(query);
    
    if (result.recordset.length === 0) {
      throw new Error('Department not found');
    }

    return result.recordset[0];
  }

  async delete(id: number): Promise<boolean> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM department WHERE id = @id');

    return result.rowsAffected[0] > 0;
  }
}

export default new DepartmentService();
