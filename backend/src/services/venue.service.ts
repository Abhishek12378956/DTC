import sql from 'mssql';
import getPool from '../config/db';
import { Venue, VenueCreateInput, VenueUpdateInput, PaginatedVenuesResponse } from '../models/venue.model';

export class VenueService {
  async findAll(params?: {
    includeInactive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedVenuesResponse> {
    const pool = await getPool();
    let request = pool.request();

    // Set default pagination values
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'WHERE is_active = 1';
    if (params?.includeInactive) {
      whereClause = '';
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM venues 
      ${whereClause}
    `;
    
    // Get venues with pagination
    const query = `
      SELECT id, name, description, conferenceRoom, is_active, createdAt, updatedAt
      FROM venues 
      ${whereClause}
      ORDER BY name
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    // Execute queries
    const countResult = await request.input('offset', sql.Int, offset)
                                 .input('limit', sql.Int, limit)
                                 .query(countQuery);
    
    request = pool.request();
    const venuesResult = await request.input('offset', sql.Int, offset)
                                       .input('limit', sql.Int, limit)
                                       .query(query);

    const total = countResult.recordset[0].total;
    const venues = venuesResult.recordset;

    return {
      venues: venues.map((venue: any) => ({
        id: venue.id,
        name: venue.name,
        description: venue.description,
        conferenceRoom: venue.conferenceRoom,
        is_active: venue.is_active,
        createdAt: venue.createdAt,
        updatedAt: venue.updatedAt
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

  async findById(id: number): Promise<Venue | null> {
    const pool = await getPool();
    const request = pool.request();
    
    const query = `
      SELECT id, name, description, conferenceRoom, is_active, createdAt, updatedAt
      FROM venues 
      WHERE id = @id
    `;
    
    const result = await request.input('id', sql.Int, id).query(query);
    
    if (result.recordset.length === 0) {
      return null;
    }

    const venue = result.recordset[0];
    return {
      id: venue.id,
      name: venue.name,
      description: venue.description,
      conferenceRoom: venue.conferenceRoom,
      is_active: venue.is_active,
      createdAt: venue.createdAt,
      updatedAt: venue.updatedAt
    };
  }

  async create(venueData: VenueCreateInput): Promise<Venue> {
    const pool = await getPool();
    let request = pool.request();

    // Check if venue already exists
    const existingQuery = `SELECT id FROM venues WHERE name = @name`;
    const existingResult = await request.input('name', sql.NVarChar, venueData.name).query(existingQuery);
    
    if (existingResult.recordset.length > 0) {
      throw new Error('Venue with this name already exists');
    }

    // Insert new venue
    request = pool.request();
    const insertQuery = `
      INSERT INTO venues (name, description, conferenceRoom, is_active, createdAt, updatedAt)
      VALUES (@name, @description, @conferenceRoom, @is_active, GETDATE(), GETDATE());
      
      SELECT SCOPE_IDENTITY() as id;
    `;

    const result = await request
      .input('name', sql.NVarChar, venueData.name)
      .input('description', sql.NVarChar, venueData.description || null)
      .input('conferenceRoom', sql.NVarChar, venueData.conferenceRoom || null)
      .input('is_active', sql.Bit, venueData.is_active || true)
      .query(insertQuery);
    
    const newVenueId = result.recordset[0].id;

    return {
      id: newVenueId,
      name: venueData.name,
      description: venueData.description,
      conferenceRoom: venueData.conferenceRoom,
      is_active: venueData.is_active || true
    };
  }

  async update(id: number, venueData: VenueUpdateInput): Promise<void> {
    const pool = await getPool();
    let request = pool.request();

    // Check if venue exists
    const existingQuery = `SELECT id FROM venues WHERE id = @id`;
    const existingResult = await request.input('id', sql.Int, id).query(existingQuery);
    
    if (existingResult.recordset.length === 0) {
      throw new Error('Venue not found');
    }

    // Check if name conflicts with existing venue (excluding current one)
    if (venueData.name) {
      request = pool.request();
      const nameConflictQuery = `SELECT id FROM venues WHERE name = @name AND id != @id`;
      const conflictResult = await request
        .input('name', sql.NVarChar, venueData.name)
        .input('id', sql.Int, id)
        .query(nameConflictQuery);
      
      if (conflictResult.recordset.length > 0) {
        throw new Error('Venue with this name already exists');
      }
    }

    // Build update query dynamically
    const updateFields = [];
    if (venueData.name !== undefined) updateFields.push(`name = @name`);
    if (venueData.description !== undefined) updateFields.push(`description = @description`);
    if (venueData.conferenceRoom !== undefined) updateFields.push(`conferenceRoom = @conferenceRoom`);
    if (venueData.is_active !== undefined) updateFields.push(`is_active = @is_active`);
    
    updateFields.push('updatedAt = GETDATE()');

    const updateQuery = `
      UPDATE venues 
      SET ${updateFields.join(', ')}
      WHERE id = @id
    `;

    request = pool.request();
    request.input('id', sql.Int, id);
    
    if (venueData.name !== undefined) request.input('name', sql.NVarChar, venueData.name);
    if (venueData.description !== undefined) request.input('description', sql.NVarChar, venueData.description || null);
    if (venueData.conferenceRoom !== undefined) request.input('conferenceRoom', sql.NVarChar, venueData.conferenceRoom || null);
    if (venueData.is_active !== undefined) request.input('is_active', sql.Bit, venueData.is_active);
    
    await request.query(updateQuery);
  }

  async delete(id: number): Promise<void> {
    const pool = await getPool();
    let request = pool.request();

    // Check if venue exists
    const existingQuery = `SELECT id FROM venues WHERE id = @id`;
    const existingResult = await request.input('id', sql.Int, id).query(existingQuery);
    
    if (existingResult.recordset.length === 0) {
      throw new Error('Venue not found');
    }

    // Check if venue is being used in trainings
    request = pool.request();
    const usageQuery = `SELECT COUNT(*) as count FROM trainings WHERE venueId = @id`;
    const usageResult = await request.input('id', sql.Int, id).query(usageQuery);
    const usageCount = usageResult.recordset[0].count;

    if (usageCount > 0) {
      throw new Error(`Cannot delete venue. It is being used by ${usageCount} training(s). Please disable it instead.`);
    }

    // Soft delete (disable) the venue
    request = pool.request();
    const deleteQuery = `UPDATE venues SET is_active = 0, updatedAt = GETDATE() WHERE id = @id`;
    await request.input('id', sql.Int, id).query(deleteQuery);
  }

  async getActiveVenues(): Promise<{ value: number; label: string }[]> {
    const pool = await getPool();
    const request = pool.request();
    
    const query = `
      SELECT id, name 
      FROM venues 
      WHERE is_active = 1 
      ORDER BY name
    `;
    
    const result = await request.query(query);
    return result.recordset.map((venue: any) => ({
      value: venue.id,
      label: venue.name
    }));
  }
}

const venueService = new VenueService();
export default venueService;
