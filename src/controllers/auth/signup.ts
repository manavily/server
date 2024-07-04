import type { Request, Response } from 'express';
import signup from '../../services/auth/signup';

export default async function(req: Request, res: Response) {
  try {
    const result = await signup(req.body.email, req.body.password, req.body.role, req.body.username);
    res.status(result.code).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Unknown server error' });
    }
  }
}
