import { Request, Response, NextFunction } from 'express';

export const responseTime = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  const originalEnd = res.end.bind(res);
  res.end = function (this: Response, ...args: any[]) {
    const duration = Date.now() - start;
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration}ms`);
    }
    return (originalEnd as Function)(...args);
  } as typeof res.end;

  next();
};
