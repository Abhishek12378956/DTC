import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt.util';
import userService from '../services/user.service';
import { AuthRequest } from '../middleware/authMiddleware';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const user = await userService.findByEmail(email);

      if (!user || !user.passwordHash) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const token = generateToken(user.id!);

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          staffId: user.staffId,
          firstName: user.firstName,
          lastName: user.lastName,
          roleId: user.roleId,
          roleName: user.roleName,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await userService.findById(req.user!.id);

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
}

export default new AuthController();

