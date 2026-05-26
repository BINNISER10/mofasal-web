import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import logger from '../utils/logger';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof ApiError) {
    logger.warn(`API Error: ${err.statusCode} - ${err.message}`, { details: err.details });
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  logger.error('Unhandled Error:', { message: err.message, stack: err.stack });

  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
    },
  });
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
    },
  });
};
