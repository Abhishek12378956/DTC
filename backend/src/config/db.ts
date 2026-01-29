import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE || 'DTC',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'Abhi123',
  port: Number(process.env.DB_PORT || 1433),
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    requestTimeout: 60000,
  },
  pool: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 60000,
    acquireTimeoutMillis: 60000,
  },
  connectionTimeout: 60000,
  requestTimeout: 60000,
};

let pool: sql.ConnectionPool | null = null;

export const getPool = async (): Promise<sql.ConnectionPool> => {
  if (pool && pool.connected) {
    return pool;
  }

  let retries = 3;
  let lastError: any;

  while (retries > 0) {
    try {
      pool = new sql.ConnectionPool(config);
      await pool.connect();
      console.log('Connected to SQL Server');
      return pool;
    } catch (err: any) {
      lastError = err;
      console.error(`Database connection attempt ${4 - retries} failed:`, err.message);
      retries--;
      
      if (retries > 0) {
        console.log(`Retrying in 2 seconds... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  pool = null;
  console.error('Database connection failed after all retries:', lastError);
  throw lastError;
};

export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.close();
    pool = null;
  }
};

export default getPool;
