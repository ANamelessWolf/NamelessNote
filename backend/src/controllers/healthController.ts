import { Request, Response } from 'express';

export const health = (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'NamelessNoteBackend', ts: new Date().toISOString() });
};
