import type { Request, Response } from 'express';
import twoFactorService from '../../services/auth/two-factor';

async function setup(req: Request, res: Response) {
  try {
    const result = await twoFactorService.setup((req as any).user.id);
    res.status(result.code).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Unknown server error' });
    }
  }
}

async function verify(req: Request, res: Response) {
  try {
    const result = await twoFactorService.verify((req as any).user.id, req.body.token);
    res.status(result.code).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Unknown server error' });
    }
  }
}

export default {setup, verify}
