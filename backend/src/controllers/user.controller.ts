import { Response } from 'express';
import userService from '../services/user.service';
import { UserCreateInput, UserUpdateInput } from '../models/user.model';
import { AuthRequest } from '../middleware/authMiddleware';

export class UserController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { 
        search, 
        roleId, 
        dmtId, 
        department, 
        function: func, 
        page, 
        limit 
      } = req.query;
      
      const result = await userService.findAll({
        search: search as string,
        roleId: roleId ? parseInt(roleId as string) : undefined,
        dmtId: dmtId ? parseInt(dmtId as string) : undefined,
        department: department as string,
        function: func as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      
      res.json(result);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const user = await userService.findById(id);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const input: UserCreateInput = {
        staffId: req.body.staffId,
        employeeId: req.body.employeeId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        department: req.body.department,
        function: req.body.function,
        level: req.body.level,
        grade: req.body.grade,
        dmtId: req.body.dmtId,
        managerId: req.body.managerId,
        positionId: req.body.positionId,
        roleId: req.body.roleId,
      };
      console.log("rolerole", input);

      if (!input.staffId || !input.firstName || !input.email || !input.password || !input.roleId) {
        res.status(400).json({ error: 'Required fields: staffId, firstName, email, password, roleId' });
        return;
      }

      // Check if employee ID already exists
      if (input.employeeId) {
        const existingUser = await userService.findByEmployeeId(input.employeeId);
        if (existingUser) {
          res.status(400).json({ error: 'Employee ID already exists' });
          return;
        }
      }

      const user = await userService.create(input);
      res.status(201).json(user);
    } catch (error: any) {
      if (error.number === 2627) {
        res.status(400).json({ error: 'Duplicate entry: staffId or email already exists' });
      } else {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const input: UserUpdateInput = req.body;

      const user = await userService.update(id, input);
      res.json(user);
    } catch (error: any) {
      if (error.message === 'No fields to update') {
        res.status(400).json({ error: error.message });
      } else if (error.message === 'User not found after update') {
        res.status(404).json({ error: 'User not found' });
      } else {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const deleted = await userService.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new UserController();

