import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, ZodType } from 'zod';
import { ApiError } from '../utils/ApiError';

type ValidationTarget = 'body' | 'query' | 'params';

export const validate = (schema: AnyZodObject | ZodType, source: ValidationTarget = 'body') => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await schema.parseAsync(req[source]);
      req[source] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(ApiError.unprocessable('Validation failed', details));
      } else {
        next(error);
      }
    }
  };
};

export const validateAll = (body?: AnyZodObject, query?: AnyZodObject, params?: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (body) req.body = await body.parseAsync(req.body);
      if (query) req.query = await query.parseAsync(req.query) as any;
      if (params) req.params = await params.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(ApiError.unprocessable('Validation failed', details));
      } else {
        next(error);
      }
    }
  };
};
