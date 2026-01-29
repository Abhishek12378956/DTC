import sql from 'mssql';
import getPool from '../config/db';
import { Training, TrainingCreateInput, TrainingUpdateInput, PaginatedTrainingsResponse } from '../models/training.model';

export class TrainingService {
  async findAll(params?: {
    search?: string;
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedTrainingsResponse> {
    const startTime = Date.now();
    const pool = await getPool();
    let request = pool.request();

    // Set default pagination values
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    
    if (params?.search) {
      whereClause += ` AND (t.topic LIKE @search OR t.description LIKE @search)`;
      request.input('search', sql.NVarChar, `%${params.search}%`);
    }

    if (params?.status) {
      whereClause += ` AND t.status = @status`;
      request.input('status', sql.NVarChar, params.status);
    }

    if (params?.category) {
      whereClause += ` AND t.category = @category`;
      request.input('category', sql.NVarChar, params.category);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM trainings t
      LEFT JOIN users u ON t.createdBy = u.id
      ${whereClause}
    `;

    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;

    // Get paginated data
    const dataQuery = `
      SELECT t.*, 
             u.firstName + ' ' + u.lastName as createdByName,
             tr.id as trainer_id,
             tr.trainerName as trainer_name,
             tr.trainerType as trainer_type
      FROM trainings t
      LEFT JOIN users u ON t.createdBy = u.id
      LEFT JOIN trainers tr ON t.trainerId = tr.id
      ${whereClause}
      ORDER BY CASE WHEN t.trainingStartDate IS NOT NULL THEN 0 ELSE 1 END, t.trainingStartDate DESC, t.createdAt DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    request.input("offset", sql.Int, offset);
    request.input("limit", sql.Int, limit);

    const dataResult = await request.query(dataQuery);
    const trainings = dataResult.recordset.map(training => {
      // Transform flat result to nested trainer object
      const transformedTraining = {
        ...training,
        trainer: training.trainer_id ? {
          id: training.trainer_id,
          name: training.trainer_name,
          type: training.trainer_type
        } : null
      };
      
      // Remove the flat trainer fields
      delete transformedTraining.trainer_id;
      delete transformedTraining.trainer_name;
      delete transformedTraining.trainer_type;
      
      return transformedTraining;
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const duration = Date.now() - startTime;
    console.log(`Training findAll took ${duration}ms for page ${page}, limit ${limit}`);
    
    return {
      trainings,
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

  async findById(id: number): Promise<Training | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT t.*, 
               u.firstName + ' ' + u.lastName as createdByName,
               tr.id as trainer_id,
               tr.trainerName as trainer_name,
               tr.trainerType as trainer_type
        FROM trainings t
        LEFT JOIN users u ON t.createdBy = u.id
        LEFT JOIN trainers tr ON t.trainerId = tr.id
        WHERE t.id = @id
      `);

    if (!result.recordset[0]) return null;
    
    const training = result.recordset[0];
    
    // Transform flat result to nested trainer object
    const transformedTraining = {
      ...training,
      trainer: training.trainer_id ? {
        id: training.trainer_id,
        name: training.trainer_name,
        type: training.trainer_type
      } : null
    };
    
    // Remove the flat trainer fields
    delete transformedTraining.trainer_id;
    delete transformedTraining.trainer_name;
    delete transformedTraining.trainer_type;

    return transformedTraining;
  }

  async create(input: TrainingCreateInput): Promise<Training> {
    const pool = await getPool();

    const startDateTime = input.trainingStartDate ? new Date(input.trainingStartDate) : null;
    const endDateTime = input.trainingEndDate ? new Date(input.trainingEndDate) : null;

    const result = await pool
      .request()
      .input('topic', sql.NVarChar, input.topic)
      .input('description', sql.NVarChar, input.description || null)
      .input('venueId', sql.Int, input.venueId || null)
      .input('trainingStartDate', sql.DateTime2, startDateTime && !isNaN(startDateTime.getTime()) ? startDateTime : null)
      .input('trainingEndDate', sql.DateTime2, endDateTime && !isNaN(endDateTime.getTime()) ? endDateTime : null)
      .input('trainerId', sql.Int, input.trainerId && input.trainerId !== 0 ? input.trainerId : null)
      .input('duration', sql.Int, input.duration || null)
      .input('categoryId', sql.Int, input.categoryId || null)
      .input('createdBy', sql.Int, input.createdBy)
      .query(`
        INSERT INTO trainings (topic, description, venueId, trainingStartDate, trainingEndDate, 
                              trainerId, duration, categoryId, createdBy)
        OUTPUT INSERTED.*
        VALUES (@topic, @description, @venueId, @trainingStartDate, @trainingEndDate,
                @trainerId, @duration, @categoryId, @createdBy)
      `);

    return result.recordset[0];
  }

  async update(id: number, input: TrainingUpdateInput): Promise<Training> {
    const pool = await getPool();
    let request = pool.request().input('id', sql.Int, id);

    const updates: string[] = [];
    if (input.topic !== undefined) {
      updates.push('topic = @topic');
      request.input('topic', sql.NVarChar, input.topic);
    }
    if (input.description !== undefined) {
      updates.push('description = @description');
      request.input('description', sql.NVarChar, input.description);
    }
    if (input.venueId !== undefined) {
      updates.push('venueId = @venueId');
      request.input('venueId', sql.Int, input.venueId);
    }
    const hasStartDateTimeUpdate = input.trainingStartDate !== undefined;
    if (hasStartDateTimeUpdate) {
      updates.push('trainingStartDate = @trainingStartDate');
      request.input('trainingStartDate', sql.DateTime2, input.trainingStartDate);
    }
    if (input.trainingEndDate !== undefined) {
      updates.push('trainingEndDate = @trainingEndDate');
      request.input('trainingEndDate', sql.DateTime2, input.trainingEndDate);
    }
    if (input.trainerId !== undefined) {
      updates.push('trainerId = @trainerId');
      request.input('trainerId', sql.Int, input.trainerId);
    }
    if (input.duration !== undefined) {
      updates.push('duration = @duration');
      request.input('duration', sql.Int, input.duration);
    }
    if (input.categoryId !== undefined) {
      updates.push('categoryId = @categoryId');
      request.input('categoryId', sql.Int, input.categoryId);
    }
    if (input.status !== undefined) {
      updates.push('status = @status');
      request.input('status', sql.NVarChar, input.status);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push('updatedAt = SYSUTCDATETIME()');

    await request.query(`UPDATE trainings SET ${updates.join(', ')} WHERE id = @id`);

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Training not found after update');
    }

    return updated;
  }

  async delete(id: number): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM trainings WHERE id = @id');
  }
}

export default new TrainingService();

