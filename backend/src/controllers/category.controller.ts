import { Request, Response } from 'express';
import categoryService from '../services/category.service';
import { Category, CategoryCreateInput, CategoryUpdateInput, PaginatedCategoriesResponse } from '../models/category.model';

export class CategoryController {
  // Get all categories (active only by default)
  static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const { includeInactive, page, limit } = req.query;
      
      const result = await categoryService.findAll({
        includeInactive: includeInactive === 'true',
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json(result);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  }

  // Get category by ID
  static async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await categoryService.findById(parseInt(id));

      if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }

      res.json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ message: 'Failed to fetch category' });
    }
  }

  // Create new category
  static async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, is_active = true }: CategoryCreateInput = req.body;

      if (!name || name.trim() === '') {
        res.status(400).json({ message: 'Category name is required' });
        return;
      }

      const newCategory = await categoryService.create({ name, description, is_active });

      res.status(201).json({
        ...newCategory,
        message: 'Category created successfully'
      });
    } catch (error: any) {
      console.error('Error creating category:', error);
      res.status(500).json({ message: error.message || 'Failed to create category' });
    }
  }

  // Update category
  static async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, is_active }: CategoryUpdateInput = req.body;

      await categoryService.update(parseInt(id), { name, description, is_active });

      res.json({
        message: 'Category updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating category:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
      } else if (error.message.includes('already exists')) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message || 'Failed to update category' });
      }
    }
  }

  // Delete category (soft delete by setting is_active = false)
  static async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await categoryService.delete(parseInt(id));

      res.json({ message: 'Category disabled successfully' });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      if (error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
      } else if (error.message.includes('Cannot delete')) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message || 'Failed to delete category' });
      }
    }
  }

  // Get active categories for dropdown
  static async getActiveCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await categoryService.getActiveCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching active categories:', error);
      res.status(500).json({ message: 'Failed to fetch active categories' });
    }
  }
}
