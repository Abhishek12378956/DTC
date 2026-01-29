import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import sql from 'mssql';
import getPool from '../config/db';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    roleId: number;
    roleName: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const startTime = Date.now();
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'change_me';
    const decoded = jwt.verify(token, jwtSecret) as { userId: number };

    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, decoded.userId)
      .query(`
        SELECT u.id, u.email, u.roleId, r.name as roleName
        FROM users u
        INNER JOIN roles r ON u.roleId = r.id
        WHERE u.id = @id AND u.status = 'active'
      `);

    if (result.recordset.length === 0) {
      res.status(401).json({ error: 'Invalid token or user not found' });
      return;
    }

    req.user = {
      id: result.recordset[0].id,
      email: result.recordset[0].email,
      roleId: result.recordset[0].roleId,
      roleName: result.recordset[0].roleName,
    };

    const duration = Date.now() - startTime;
    console.log(`Auth middleware took ${duration}ms for user ${decoded.userId}`);

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.roleName)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

