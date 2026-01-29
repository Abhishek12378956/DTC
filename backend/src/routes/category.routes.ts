import { Request, Response } from 'express';
import { CategoryController } from '../controllers/category.controller';

export class CategoryRoutes {
  static registerRoutes(app: any): void {
    // Get active categories for dropdown (must come before :id route)
    app.get('/api/categories/active', CategoryController.getActiveCategories);
    
    // Get all categories with pagination and filtering
    app.get('/api/categories', CategoryController.getCategories);
    
    // Get category by ID
    app.get('/api/categories/:id', CategoryController.getCategoryById);
    
    // Create new category
    app.post('/api/categories', CategoryController.createCategory);
    
    // Update category
    app.put('/api/categories/:id', CategoryController.updateCategory);
    
    // Delete/disable category
    app.delete('/api/categories/:id', CategoryController.deleteCategory);
  }
}
