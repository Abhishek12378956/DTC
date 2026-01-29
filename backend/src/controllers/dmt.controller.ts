import { Response } from 'express';
import sql from 'mssql';
import getPool from '../config/db';
import { DMTCreateInput, PositionCreateInput } from '../models/dmt.model';
import { AuthRequest } from '../middleware/authMiddleware';

export class DMTController {
  async getPositions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const pool = await getPool();
      const result = await pool.request().query('SELECT * FROM positions ORDER BY title');
      res.json(result.recordset);
    } catch (error) {
      console.error('Get positions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createPosition(req: AuthRequest, res: Response): Promise<void> {
    try {
      const input: PositionCreateInput = req.body;

      if (!input.code || !input.title) {
        res.status(400).json({ error: 'Code and title are required' });
        return;
      }

      const pool = await getPool();
      const result = await pool
        .request()
        .input('code', sql.NVarChar, input.code)
        .input('title', sql.NVarChar, input.title)
        .input('description', sql.NVarChar, input.description || null)
        .query(`
          INSERT INTO positions (code, title, description)
          OUTPUT INSERTED.*
          VALUES (@code, @title, @description)
        `);

      res.status(201).json(result.recordset[0]);
    } catch (error: any) {
      if (error.number === 2627) {
        res.status(400).json({ error: 'Position code already exists' });
      } else {
        console.error('Create position error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getDMT(req: AuthRequest, res: Response): Promise<void> {
    try {
      const pool = await getPool();
      const result = await pool.request().query('SELECT * FROM dmt ORDER BY name');
      res.json(result.recordset);
    } catch (error) {
      console.error('Get DMT error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createDMT(req: AuthRequest, res: Response): Promise<void> {
    try {
      const input: DMTCreateInput = req.body;

      if (!input.name) {
        res.status(400).json({ error: 'Name is required' });
        return;
      }

      const pool = await getPool();
      const result = await pool
        .request()
        .input('name', sql.NVarChar, input.name)
        .input('description', sql.NVarChar, input.description || null)
        .query(`
          INSERT INTO dmt (name, description)
          OUTPUT INSERTED.*
          VALUES (@name, @description)
        `);

      res.status(201).json(result.recordset[0]);
    } catch (error) {
      console.error('Create DMT error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getRoles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const pool = await getPool();
      const result = await pool.request().query('SELECT * FROM roles ORDER BY name');
      res.json(result.recordset);
    } catch (error) {
      console.error('Get roles error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new DMTController();

