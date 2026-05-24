import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(422).json({ error: 'Validation Error', details: error.flatten() });
  }

  const message = error instanceof Error ? error.message : 'Internal Server Error';
  const status = message.includes('Invalid credentials') ? 401 : 500;
  res.status(status).json({ error: message });
}
