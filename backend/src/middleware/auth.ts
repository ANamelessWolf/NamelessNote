import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth';
import type { AuthUser } from '../utils/auth';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  const token = auth.slice('Bearer '.length).trim();

  try {
    (req as any).user = verifyAccessToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired bearer token' });
  }
}

export function getAuthenticatedUser(req: Request): AuthUser {
  const user = (req as any).user as AuthUser | undefined;
  if (!user?.sub || !user?.email) {
    throw new Error('Authenticated user payload is missing');
  }

  return user;
}
