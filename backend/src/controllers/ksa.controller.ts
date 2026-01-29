import { Response } from 'express';
import sql from 'mssql';
import getPool from '../config/db';
import { KSACreateInput, PositionKSACreateInput } from '../models/ksa.model';
import { AuthRequest } from '../middleware/authMiddleware';

export class KSAController {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const pool = await getPool();
      const result = await pool.request().query('SELECT * FROM ksa ORDER BY name');
      res.json(result.recordset);
    } catch (error) {
      console.error('Get KSA error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const input: KSACreateInput = req.body;

      if (!input.code || !input.name) {
        res.status(400).json({ error: 'Code and name are required' });
        return;
      }

      const pool = await getPool();
      const result = await pool
        .request()
        .input('code', sql.NVarChar, input.code)
        .input('name', sql.NVarChar, input.name)
        .input('description', sql.NVarChar, input.description || null)
        .input('category', sql.NVarChar, input.category || null)
        .query(`
          INSERT INTO ksa (code, name, description, category)
          OUTPUT INSERTED.*
          VALUES (@code, @name, @description, @category)
        `);

      res.status(201).json(result.recordset[0]);
    } catch (error: any) {
      if (error.number === 2627) {
        res.status(400).json({ error: 'KSA code already exists' });
      } else {
        console.error('Create KSA error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getByPosition(req: AuthRequest, res: Response): Promise<void> {
    try {
      const positionId = parseInt(req.params.positionId);
      const pool = await getPool();
      const result = await pool
        .request()
        .input('positionId', sql.Int, positionId)
        .query(`
          SELECT k.*, pk.requiredLevel
          FROM ksa k
          INNER JOIN position_ksa pk ON k.id = pk.ksaId
          WHERE pk.positionId = @positionId
          ORDER BY k.name
        `);
      res.json(result.recordset);
    } catch (error) {
      console.error('Get position KSA error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createPositionKSA(req: AuthRequest, res: Response): Promise<void> {
    try {
      const input: PositionKSACreateInput = req.body;

      if (!input.positionId || !input.ksaId) {
        res.status(400).json({ error: 'positionId and ksaId are required' });
        return;
      }

      const pool = await getPool();
      const result = await pool
        .request()
        .input('positionId', sql.Int, input.positionId)
        .input('ksaId', sql.Int, input.ksaId)
        .input('requiredLevel', sql.Int, input.requiredLevel || 1)
        .query(`
          INSERT INTO position_ksa (positionId, ksaId, requiredLevel)
          OUTPUT INSERTED.*
          VALUES (@positionId, @ksaId, @requiredLevel)
        `);

      res.status(201).json(result.recordset[0]);
    } catch (error: any) {
      if (error.number === 2627) {
        res.status(400).json({ error: 'Position-KSA mapping already exists' });
      } else {
        console.error('Create position-KSA error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}

export default new KSAController();

