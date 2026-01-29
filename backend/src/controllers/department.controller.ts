import { Response } from 'express';
import departmentService from '../services/department.service';
import { DepartmentCreateInput, DepartmentUpdateInput } from '../models/department.model';
import { AuthRequest } from '../middleware/authMiddleware';

export class DepartmentController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const departments = await departmentService.findAll();
      res.json(departments);
    } catch (error) {
      console.error('Get departments error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const department = await departmentService.findById(id);

      if (!department) {
        res.status(404).json({ error: 'Department not found' });
        return;
      }

      res.json(department);
    } catch (error) {
      console.error('Get department error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const input: DepartmentCreateInput = {
        name: req.body.name,
        description: req.body.description,
      };

      if (!input.name) {
        res.status(400).json({ error: 'Name is required' });
        return;
      }

      const department = await departmentService.create(input);
      res.status(201).json(department);
    } catch (error: any) {
      if (error.number === 2627) {
        res.status(400).json({ error: 'Department with this name already exists' });
      } else {
        console.error('Create department error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const input: DepartmentUpdateInput = req.body;

      const department = await departmentService.update(id, input);
      res.json(department);
    } catch (error: any) {
      if (error.message === 'Department not found' || error.message === 'No fields to update') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Update department error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const deleted = await departmentService.delete(id);
      
      if (!deleted) {
        res.status(404).json({ error: 'Department not found' });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Delete department error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new DepartmentController();
