import sql from 'mssql';
import getPool from '../config/db';
import { Trainer, TrainerCreateInput, TrainerUpdateInput, PaginatedTrainersResponse } from '../models/trainer.model';

export class TrainerService {
  async findAll(params?: {
    includeInactive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedTrainersResponse> {
    const pool = await getPool();
    let request = pool.request();

    // Set default pagination values
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'WHERE t.is_active = 1';
    if (params?.includeInactive) {
      whereClause = '';
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM trainers t
      ${whereClause}
    `;
    
    // Get trainers with pagination and category info
    const query = `
      SELECT t.id, t.trainerName, t.trainerType, t.profession, t.company, t.location, 
             t.qualification, t.purpose, t.categoryId, t.is_active, t.createdAt, t.updatedAt,
             c.name as categoryName
      FROM trainers t
      LEFT JOIN categories c ON t.categoryId = c.id
      ${whereClause}
      ORDER BY t.trainerName
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    // Execute queries
    const countResult = await request.input('offset', sql.Int, offset)
                                 .input('limit', sql.Int, limit)
                                 .query(countQuery);
    
    request = pool.request();
    const trainersResult = await request.input('offset', sql.Int, offset)
                                      .input('limit', sql.Int, limit)
                                      .query(query);

    const total = countResult.recordset[0].total;
    const trainers = trainersResult.recordset;

    return {
      trainers: trainers.map((trainer: any) => ({
        id: trainer.id,
        trainerName: trainer.trainerName,
        trainerType: trainer.trainerType,
        profession: trainer.profession,
        company: trainer.company,
        location: trainer.location,
        qualification: trainer.qualification,
        purpose: trainer.purpose,
        categoryId: trainer.categoryId,
        categoryName: trainer.categoryName,
        is_active: trainer.is_active,
        createdAt: trainer.createdAt,
        updatedAt: trainer.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  async findById(id: number): Promise<Trainer | null> {
    const pool = await getPool();
    const request = pool.request();
    
    const query = `
      SELECT t.id, t.trainerName, t.trainerType, t.profession, t.company, t.location, 
             t.qualification, t.purpose, t.categoryId, t.is_active, t.createdAt, t.updatedAt,
             c.name as categoryName
      FROM trainers t
      LEFT JOIN categories c ON t.categoryId = c.id
      WHERE t.id = @id
    `;
    
    const result = await request.input('id', sql.Int, id).query(query);
    
    if (result.recordset.length === 0) {
      return null;
    }

    const trainer = result.recordset[0];
    return {
      id: trainer.id,
      trainerName: trainer.trainerName,
      trainerType: trainer.trainerType,
      profession: trainer.profession,
      company: trainer.company,
      location: trainer.location,
      qualification: trainer.qualification,
      purpose: trainer.purpose,
      categoryId: trainer.categoryId,
      categoryName: trainer.categoryName,
      is_active: trainer.is_active,
      createdAt: trainer.createdAt,
      updatedAt: trainer.updatedAt
    };
  }

  async create(trainerData: TrainerCreateInput): Promise<Trainer> {
    const pool = await getPool();
    let request = pool.request();

    // Check if trainer name already exists
    const existingQuery = `SELECT id FROM trainers WHERE trainerName = @trainerName`;
    const existingResult = await request.input('trainerName', sql.NVarChar, trainerData.trainerName).query(existingQuery);
    
    if (existingResult.recordset.length > 0) {
      throw new Error('Trainer with this name already exists');
    }

    // Validate category if provided
    if (trainerData.categoryId) {
      request = pool.request();
      const categoryQuery = `SELECT id FROM categories WHERE id = @categoryId AND is_active = 1`;
      const categoryResult = await request.input('categoryId', sql.Int, trainerData.categoryId).query(categoryQuery);
      
      if (categoryResult.recordset.length === 0) {
        throw new Error('Invalid or inactive category selected');
      }
    }

    // Insert new trainer
    request = pool.request();
    const insertQuery = `
      INSERT INTO trainers (trainerName, trainerType, profession, company, location, qualification, purpose, categoryId, is_active, createdAt, updatedAt)
      VALUES (@trainerName, @trainerType, @profession, @company, @location, @qualification, @purpose, @categoryId, @is_active, GETDATE(), GETDATE());
      
      SELECT SCOPE_IDENTITY() as id;
    `;

    const result = await request
      .input('trainerName', sql.NVarChar, trainerData.trainerName)
      .input('trainerType', sql.NVarChar, trainerData.trainerType)
      .input('profession', sql.NVarChar, trainerData.profession || null)
      .input('company', sql.NVarChar, trainerData.company || null)
      .input('location', sql.NVarChar, trainerData.location || null)
      .input('qualification', sql.NVarChar, trainerData.qualification || null)
      .input('purpose', sql.NVarChar, trainerData.purpose || null)
      .input('categoryId', sql.Int, trainerData.categoryId || null)
      .input('is_active', sql.Bit, trainerData.is_active || true)
      .query(insertQuery);
    
    const newTrainerId = result.recordset[0].id;

    return {
      id: newTrainerId,
      trainerName: trainerData.trainerName,
      trainerType: trainerData.trainerType,
      profession: trainerData.profession,
      company: trainerData.company,
      location: trainerData.location,
      qualification: trainerData.qualification,
      purpose: trainerData.purpose,
      categoryId: trainerData.categoryId,
      is_active: trainerData.is_active || true
    };
  }

  async update(id: number, trainerData: TrainerUpdateInput): Promise<void> {
    const pool = await getPool();
    let request = pool.request();

    // Check if trainer exists
    const existingQuery = `SELECT id FROM trainers WHERE id = @id`;
    const existingResult = await request.input('id', sql.Int, id).query(existingQuery);
    
    if (existingResult.recordset.length === 0) {
      throw new Error('Trainer not found');
    }

    // Check if name conflicts with existing trainer (excluding current one)
    if (trainerData.trainerName) {
      request = pool.request();
      const nameConflictQuery = `SELECT id FROM trainers WHERE trainerName = @trainerName AND id != @id`;
      const conflictResult = await request
        .input('trainerName', sql.NVarChar, trainerData.trainerName)
        .input('id', sql.Int, id)
        .query(nameConflictQuery);
      
      if (conflictResult.recordset.length > 0) {
        throw new Error('Trainer with this name already exists');
      }
    }

    // Validate category if provided
    if (trainerData.categoryId) {
      request = pool.request();
      const categoryQuery = `SELECT id FROM categories WHERE id = @categoryId AND is_active = 1`;
      const categoryResult = await request.input('categoryId', sql.Int, trainerData.categoryId).query(categoryQuery);
      
      if (categoryResult.recordset.length === 0) {
        throw new Error('Invalid or inactive category selected');
      }
    }

    // Build update query dynamically
    const updateFields = [];
    if (trainerData.trainerName !== undefined) updateFields.push(`trainerName = @trainerName`);
    if (trainerData.trainerType !== undefined) updateFields.push(`trainerType = @trainerType`);
    if (trainerData.profession !== undefined) updateFields.push(`profession = @profession`);
    if (trainerData.company !== undefined) updateFields.push(`company = @company`);
    if (trainerData.location !== undefined) updateFields.push(`location = @location`);
    if (trainerData.qualification !== undefined) updateFields.push(`qualification = @qualification`);
    if (trainerData.purpose !== undefined) updateFields.push(`purpose = @purpose`);
    if (trainerData.categoryId !== undefined) updateFields.push(`categoryId = @categoryId`);
    if (trainerData.is_active !== undefined) updateFields.push(`is_active = @is_active`);
    
    updateFields.push('updatedAt = GETDATE()');

    const updateQuery = `
      UPDATE trainers 
      SET ${updateFields.join(', ')}
      WHERE id = @id
    `;

    request = pool.request();
    request.input('id', sql.Int, id);
    
    if (trainerData.trainerName !== undefined) request.input('trainerName', sql.NVarChar, trainerData.trainerName);
    if (trainerData.trainerType !== undefined) request.input('trainerType', sql.NVarChar, trainerData.trainerType);
    if (trainerData.profession !== undefined) request.input('profession', sql.NVarChar, trainerData.profession || null);
    if (trainerData.company !== undefined) request.input('company', sql.NVarChar, trainerData.company || null);
    if (trainerData.location !== undefined) request.input('location', sql.NVarChar, trainerData.location || null);
    if (trainerData.qualification !== undefined) request.input('qualification', sql.NVarChar, trainerData.qualification || null);
    if (trainerData.purpose !== undefined) request.input('purpose', sql.NVarChar, trainerData.purpose || null);
    if (trainerData.categoryId !== undefined) request.input('categoryId', sql.Int, trainerData.categoryId || null);
    if (trainerData.is_active !== undefined) request.input('is_active', sql.Bit, trainerData.is_active);
    
    await request.query(updateQuery);
  }

  async delete(id: number): Promise<void> {
    const pool = await getPool();
    let request = pool.request();

    // Check if trainer exists
    const existingQuery = `SELECT id FROM trainers WHERE id = @id`;
    const existingResult = await request.input('id', sql.Int, id).query(existingQuery);
    
    if (existingResult.recordset.length === 0) {
      throw new Error('Trainer not found');
    }

    // Check if trainer is being used in trainings
    request = pool.request();
    const usageQuery = `SELECT COUNT(*) as count FROM trainings WHERE trainerId = @id`;
    const usageResult = await request.input('id', sql.Int, id).query(usageQuery);
    const usageCount = usageResult.recordset[0].count;

    if (usageCount > 0) {
      throw new Error(`Cannot delete trainer. They are assigned to ${usageCount} training(s). Please disable them instead.`);
    }

    // Soft delete (disable) the trainer
    request = pool.request();
    const deleteQuery = `UPDATE trainers SET is_active = 0, updatedAt = GETDATE() WHERE id = @id`;
    await request.input('id', sql.Int, id).query(deleteQuery);
  }

  async getActiveTrainers(): Promise<{ value: number; label: string }[]> {
    const pool = await getPool();
    const request = pool.request();
    
    const query = `
      SELECT id, trainerName 
      FROM trainers 
      WHERE is_active = 1 
      ORDER BY trainerName
    `;
    
    const result = await request.query(query);
    return result.recordset.map((trainer: any) => ({
      value: trainer.id,
      label: trainer.trainerName
    }));
  }
}

const trainerService = new TrainerService();
export default trainerService;
