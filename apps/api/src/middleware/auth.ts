import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/tokens.js';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; roles: string[]; permissions: string[] };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.access_token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, roles: payload.roles, permissions: payload.permissions };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.permissions.includes('*') || req.user.permissions.includes(permission)) return next();
    return res.status(403).json({ error: 'Forbidden' });
  };
}

