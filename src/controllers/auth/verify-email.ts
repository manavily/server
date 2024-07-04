import type { Request, Response } from 'express';
import verifyEmail from '../../services/auth/verify-email';

export default async function(req: Request, res: Response) {
  if (!req.query.token) {
    res.status(400).json({ message: 'Verification token is required' });
  }
  try {
    const result = await verifyEmail(req.query.token as string);
    res.status(result.code).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Unknown server error' });
    }
  }
}
