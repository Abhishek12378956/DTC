import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
}

export const errorMiddleware = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  console.error('Error:', err);

  res.status(statusCode).json({
    status,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error: AppError = new Error(`Not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

