import type { Request, Response } from 'express';
import signIn from '../../services/auth/signin';

export default async function(req: Request, res: Response) {
  try {
    const result = await signIn(req.body.username, req.body.password);
    res.status(result.code).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Unknown server error' });
    }
  }
}
