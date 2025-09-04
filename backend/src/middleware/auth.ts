import { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }
  (req as any).user = { sub: 'dev', email: 'dev@example.com' };
  return next();
}
