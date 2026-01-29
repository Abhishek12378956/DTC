import sql from 'mssql';
import getPool from '../config/db';
import { Category, CategoryCreateInput, CategoryUpdateInput, PaginatedCategoriesResponse } from '../models/category.model';

export class CategoryService {
  async findAll(params?: {
    includeInactive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedCategoriesResponse> {
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
      FROM categories 
      ${whereClause}
    `;
    
    // Get categories with pagination
    const query = `
      SELECT id, name, description, is_active, createdAt, updatedAt
      FROM categories 
      ${whereClause}
      ORDER BY name
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    // Execute queries
    const countResult = await request.input('offset', sql.Int, offset)
                                 .input('limit', sql.Int, limit)
                                 .query(countQuery);
    
    request = pool.request();
    const categoriesResult = await request.input('offset', sql.Int, offset)
                                       .input('limit', sql.Int, limit)
                                       .query(query);

    const total = countResult.recordset[0].total;
    const categories = categoriesResult.recordset;

    return {
      categories: categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        is_active: cat.is_active,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt
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

  async findById(id: number): Promise<Category | null> {
    const pool = await getPool();
    const request = pool.request();
    
    const query = `
      SELECT id, name, description, is_active, createdAt, updatedAt
      FROM categories 
      WHERE id = @id
    `;
    
    const result = await request.input('id', sql.Int, id).query(query);
    
    if (result.recordset.length === 0) {
      return null;
    }

    const category = result.recordset[0];
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      is_active: category.is_active,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };
  }

  async create(categoryData: CategoryCreateInput): Promise<Category> {
    const pool = await getPool();
    let request = pool.request();

    // Check if category already exists
    const existingQuery = `SELECT id FROM categories WHERE name = @name`;
    const existingResult = await request.input('name', sql.NVarChar, categoryData.name).query(existingQuery);
    
    if (existingResult.recordset.length > 0) {
      throw new Error('Category with this name already exists');
    }

    // Insert new category
    request = pool.request();
    const insertQuery = `
      INSERT INTO categories (name, description, is_active, createdAt, updatedAt)
      VALUES (@name, @description, @is_active, GETDATE(), GETDATE());
      
      SELECT SCOPE_IDENTITY() as id;
    `;

    const result = await request
      .input('name', sql.NVarChar, categoryData.name)
      .input('description', sql.NVarChar, categoryData.description || null)
      .input('is_active', sql.Bit, categoryData.is_active || true)
      .query(insertQuery);
    
    const newCategoryId = result.recordset[0].id;

    return {
      id: newCategoryId,
      name: categoryData.name,
      description: categoryData.description,
      is_active: categoryData.is_active || true
    };
  }

  async update(id: number, categoryData: CategoryUpdateInput): Promise<void> {
    const pool = await getPool();
    let request = pool.request();

    // Check if category exists
    const existingQuery = `SELECT id FROM categories WHERE id = @id`;
    const existingResult = await request.input('id', sql.Int, id).query(existingQuery);
    
    if (existingResult.recordset.length === 0) {
      throw new Error('Category not found');
    }

    // Check if name conflicts with existing category (excluding current one)
    if (categoryData.name) {
      request = pool.request();
      const nameConflictQuery = `SELECT id FROM categories WHERE name = @name AND id != @id`;
      const conflictResult = await request
        .input('name', sql.NVarChar, categoryData.name)
        .input('id', sql.Int, id)
        .query(nameConflictQuery);
      
      if (conflictResult.recordset.length > 0) {
        throw new Error('Category with this name already exists');
      }
    }

    // Build update query dynamically
    const updateFields = [];
    if (categoryData.name !== undefined) updateFields.push(`name = @name`);
    if (categoryData.description !== undefined) updateFields.push(`description = @description`);
    if (categoryData.is_active !== undefined) updateFields.push(`is_active = @is_active`);
    
    updateFields.push('updatedAt = GETDATE()');

    const updateQuery = `
      UPDATE categories 
      SET ${updateFields.join(', ')}
      WHERE id = @id
    `;

    request = pool.request();
    request.input('id', sql.Int, id);
    
    if (categoryData.name !== undefined) request.input('name', sql.NVarChar, categoryData.name);
    if (categoryData.description !== undefined) request.input('description', sql.NVarChar, categoryData.description || null);
    if (categoryData.is_active !== undefined) request.input('is_active', sql.Bit, categoryData.is_active);
    
    await request.query(updateQuery);
  }

  async delete(id: number): Promise<void> {
    const pool = await getPool();
    let request = pool.request();

    // Check if category exists
    const existingQuery = `SELECT id FROM categories WHERE id = @id`;
    const existingResult = await request.input('id', sql.Int, id).query(existingQuery);
    
    if (existingResult.recordset.length === 0) {
      throw new Error('Category not found');
    }

    // Check if category is being used in trainings
    request = pool.request();
    const usageQuery = `SELECT COUNT(*) as count FROM trainings WHERE categoryId = @id`;
    const usageResult = await request.input('id', sql.Int, id).query(usageQuery);
    const usageCount = usageResult.recordset[0].count;

    if (usageCount > 0) {
      throw new Error(`Cannot delete category. It is being used by ${usageCount} training(s). Please disable it instead.`);
    }

    // Soft delete (disable) the category
    request = pool.request();
    const deleteQuery = `UPDATE categories SET is_active = 0, updatedAt = GETDATE() WHERE id = @id`;
    await request.input('id', sql.Int, id).query(deleteQuery);
  }

  async getActiveCategories(): Promise<{ value: number; label: string }[]> {
    const pool = await getPool();
    const request = pool.request();
    
    const query = `
      SELECT id, name 
      FROM categories 
      WHERE is_active = 1 
      ORDER BY name
    `;
    
    const result = await request.query(query);
    return result.recordset.map((cat: any) => ({
      value: cat.id,
      label: cat.name
    }));
  }
}

const categoryService = new CategoryService();
export default categoryService;
