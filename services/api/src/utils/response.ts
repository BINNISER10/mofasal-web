import { Response } from 'express';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
  error?: { message: string; details?: unknown };
}

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode = 200, meta?: Record<string, unknown>): void {
  const response: ApiResponse<T> = { success: true };
  if (message) response.message = message;
  response.data = data;
  if (meta) response.meta = meta;
  res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, data: T, message = 'Created successfully'): void {
  sendSuccess(res, data, message, 201);
}

export function sendPaginated<T>(res: Response, data: T[], total: number, page: number, limit: number, message?: string): void {
  sendSuccess(res, { items: data, total, page, limit }, message, 200, {
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  });
}

export function sendError(res: Response, statusCode: number, message: string, details?: unknown): void {
  const response: ApiResponse = {
    success: false,
    error: { message, ...(details ? { details } : {}) },
  };
  res.status(statusCode).json(response);
}
