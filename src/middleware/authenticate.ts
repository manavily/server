import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../lib/token';

export default function(req: Request, res: Response, next: NextFunction) {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }
  const token = req.headers.authorization.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  (req as any).user = payload;
  next();
};
