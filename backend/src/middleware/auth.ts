import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth';

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
