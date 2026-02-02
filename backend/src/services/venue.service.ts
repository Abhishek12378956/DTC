import sql from 'mssql';
import getPool from '../config/db';
import { Venue, Location, VenueCreateInput, VenueUpdateInput, LocationCreateInput, LocationUpdateInput, PaginatedVenuesResponse, PaginatedLocationsResponse, LocationOption, VenueOption } from '../models/venue.model';

export class VenueService {
  // Location methods
  async findAllLocations(params?: {
    includeInactive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedLocationsResponse> {
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
      FROM locations 
      ${whereClause}
    `;
    
    // Get locations with pagination
    const query = `
      SELECT id, name, description, is_active, createdAt, updatedAt
      FROM locations 
      ${whereClause}
      ORDER BY name
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    // Execute queries
    const countResult = await request.input('offset', sql.Int, offset)
                                 .input('limit', sql.Int, limit)
                                 .query(countQuery);
    
    request = pool.request();
    const locationsResult = await request.input('offset', sql.Int, offset)
                                       .input('limit', sql.Int, limit)
                                       .query(query);

    const total = countResult.recordset[0].total;
    const locations = locationsResult.recordset;

    return {
      locations: locations.map((location: any) => ({
        id: location.id,
        name: location.name,
        description: location.description,
        is_active: location.is_active,
        createdAt: location.createdAt,
        updatedAt: location.updatedAt
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
  // Venue methods (conference rooms)
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
    let whereClause = 'WHERE v.is_active = 1';
    if (params?.includeInactive) {
      whereClause = '';
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM venues v
      ${whereClause}
    `;
    
    // Get venues with location names
    const query = `
      SELECT v.id, v.name, v.locationId, v.description, v.is_active, v.createdAt, v.updatedAt,
             l.name as locationName
      FROM venues v
      LEFT JOIN locations l ON v.locationId = l.id
      ${whereClause}
      ORDER BY l.name, v.name
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
        locationId: venue.locationId,
        locationName: venue.locationName,
        description: venue.description,
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
      SELECT v.id, v.name, v.locationId, v.description, v.is_active, v.createdAt, v.updatedAt,
             l.name as locationName
      FROM venues v
      LEFT JOIN locations l ON v.locationId = l.id
      WHERE v.id = @id
    `;
    
    const result = await request.input('id', sql.Int, id).query(query);
    
    if (result.recordset.length === 0) {
      return null;
    }

    const venue = result.recordset[0];
    return {
      id: venue.id,
      name: venue.name,
      locationId: venue.locationId,
      locationName: venue.locationName,
      description: venue.description,
      is_active: venue.is_active,
      createdAt: venue.createdAt,
      updatedAt: venue.updatedAt
    };
  }

  async create(venueData: VenueCreateInput): Promise<Venue> {
    const pool = await getPool();
    let request = pool.request();

    // Check if venue already exists in the same location
    const existingQuery = `SELECT id FROM venues WHERE name = @name AND locationId = @locationId`;
    const existingResult = await request.input('name', sql.NVarChar, venueData.name)
                                      .input('locationId', sql.Int, venueData.locationId)
                                      .query(existingQuery);
    
    if (existingResult.recordset.length > 0) {
      throw new Error('Venue with this name already exists in this location');
    }

    // Insert new venue
    request = pool.request();
    const insertQuery = `
      INSERT INTO venues (name, locationId, description, is_active, createdAt, updatedAt)
      VALUES (@name, @locationId, @description, @is_active, GETDATE(), GETDATE());
      
      SELECT SCOPE_IDENTITY() as id;
    `;

    const result = await request
      .input('name', sql.NVarChar, venueData.name)
      .input('locationId', sql.Int, venueData.locationId)
      .input('description', sql.NVarChar, venueData.description || null)
      .input('is_active', sql.Bit, venueData.is_active || true)
      .query(insertQuery);
    
    const newVenueId = result.recordset[0].id;

    return {
      id: newVenueId,
      name: venueData.name,
      locationId: venueData.locationId,
      description: venueData.description,
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
      const nameConflictQuery = `SELECT id FROM venues WHERE name = @name AND locationId = @locationId AND id != @id`;
      const conflictResult = await request
        .input('name', sql.NVarChar, venueData.name)
        .input('locationId', sql.Int, venueData.locationId || 0)
        .input('id', sql.Int, id)
        .query(nameConflictQuery);
      
      if (conflictResult.recordset.length > 0) {
        throw new Error('Venue with this name already exists in this location');
      }
    }

    // Build update query dynamically
    const updateFields = [];
    if (venueData.name !== undefined) updateFields.push(`name = @name`);
    if (venueData.locationId !== undefined) updateFields.push(`locationId = @locationId`);
    if (venueData.description !== undefined) updateFields.push(`description = @description`);
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
    if (venueData.locationId !== undefined) request.input('locationId', sql.Int, venueData.locationId);
    if (venueData.description !== undefined) request.input('description', sql.NVarChar, venueData.description || null);
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

  // Location methods
  async createLocation(locationData: LocationCreateInput): Promise<Location> {
    const pool = await getPool();
    let request = pool.request();

    // Check if location already exists
    const existingQuery = `SELECT id FROM locations WHERE name = @name`;
    const existingResult = await request.input('name', sql.NVarChar, locationData.name).query(existingQuery);
    
    if (existingResult.recordset.length > 0) {
      throw new Error('Location with this name already exists');
    }

    // Insert new location
    request = pool.request();
    const insertQuery = `
      INSERT INTO locations (name, description, is_active, createdAt, updatedAt)
      VALUES (@name, @description, @is_active, GETDATE(), GETDATE());
      
      SELECT SCOPE_IDENTITY() as id;
    `;

    const result = await request
      .input('name', sql.NVarChar, locationData.name)
      .input('description', sql.NVarChar, locationData.description || null)
      .input('is_active', sql.Bit, locationData.is_active || true)
      .query(insertQuery);
    
    const newLocationId = result.recordset[0].id;

    return {
      id: newLocationId,
      name: locationData.name,
      description: locationData.description,
      is_active: locationData.is_active || true
    };
  }

  async updateLocation(id: number, locationData: LocationUpdateInput): Promise<void> {
    const pool = await getPool();
    let request = pool.request();

    // Check if location exists
    const existingQuery = `SELECT id FROM locations WHERE id = @id`;
    const existingResult = await request.input('id', sql.Int, id).query(existingQuery);
    
    if (existingResult.recordset.length === 0) {
      throw new Error('Location not found');
    }

    // Check if name conflicts with existing location (excluding current one)
    if (locationData.name) {
      request = pool.request();
      const nameConflictQuery = `SELECT id FROM locations WHERE name = @name AND id != @id`;
      const conflictResult = await request
        .input('name', sql.NVarChar, locationData.name)
        .input('id', sql.Int, id)
        .query(nameConflictQuery);
      
      if (conflictResult.recordset.length > 0) {
        throw new Error('Location with this name already exists');
      }
    }

    // Build update query dynamically
    const updateFields = [];
    if (locationData.name !== undefined) updateFields.push(`name = @name`);
    if (locationData.description !== undefined) updateFields.push(`description = @description`);
    if (locationData.is_active !== undefined) updateFields.push(`is_active = @is_active`);
    
    updateFields.push('updatedAt = GETDATE()');

    const updateQuery = `
      UPDATE locations 
      SET ${updateFields.join(', ')}
      WHERE id = @id
    `;

    request = pool.request();
    request.input('id', sql.Int, id);
    
    if (locationData.name !== undefined) request.input('name', sql.NVarChar, locationData.name);
    if (locationData.description !== undefined) request.input('description', sql.NVarChar, locationData.description || null);
    if (locationData.is_active !== undefined) request.input('is_active', sql.Bit, locationData.is_active);
    
    await request.query(updateQuery);
  }

  async deleteLocation(id: number): Promise<void> {
    const pool = await getPool();
    let request = pool.request();

    // Check if location exists
    const existingQuery = `SELECT id FROM locations WHERE id = @id`;
    const existingResult = await request.input('id', sql.Int, id).query(existingQuery);
    
    if (existingResult.recordset.length === 0) {
      throw new Error('Location not found');
    }

    // Check if location has venues
    request = pool.request();
    const usageQuery = `SELECT COUNT(*) as count FROM venues WHERE locationId = @id`;
    const usageResult = await request.input('id', sql.Int, id).query(usageQuery);
    const usageCount = usageResult.recordset[0].count;

    if (usageCount > 0) {
      throw new Error(`Cannot delete location. It has ${usageCount} venue(s). Please disable it instead.`);
    }

    // Soft delete (disable) the location
    request = pool.request();
    const deleteQuery = `UPDATE locations SET is_active = 0, updatedAt = GETDATE() WHERE id = @id`;
    await request.input('id', sql.Int, id).query(deleteQuery);
  }

  // Get active locations for dropdown
  async getActiveLocations(): Promise<LocationOption[]> {
    const pool = await getPool();
    const request = pool.request();
    
    const query = `
      SELECT id, name 
      FROM locations 
      WHERE is_active = 1 
      ORDER BY name
    `;
    
    const result = await request.query(query);
    return result.recordset.map((location: any) => ({
      value: location.id,
      label: location.name
    }));
  }

  // Get active venues for dropdown (updated for new structure)
  async getActiveVenues(): Promise<VenueOption[]> {
    const pool = await getPool();
    const request = pool.request();
    
    const query = `
      SELECT v.id, v.name, v.locationId, l.name as locationName
      FROM venues v
      LEFT JOIN locations l ON v.locationId = l.id
      WHERE v.is_active = 1 AND l.is_active = 1
      ORDER BY l.name, v.name
    `;
    
    const result = await request.query(query);
    return result.recordset.map((venue: any) => ({
      value: venue.id,
      label: venue.name,
      locationId: venue.locationId
    }));
  }

  // Get venues by location for dropdown
  async getVenuesByLocation(locationId: number): Promise<VenueOption[]> {
    const pool = await getPool();
    const request = pool.request();
    
    const query = `
      SELECT id, name, locationId
      FROM venues 
      WHERE is_active = 1 AND locationId = @locationId
      ORDER BY name
    `;
    
    const result = await request.input('locationId', sql.Int, locationId).query(query);
    return result.recordset.map((venue: any) => ({
      value: venue.id,
      label: venue.name,
      locationId: venue.locationId
    }));
  }
}

const venueService = new VenueService();
export default venueService;
