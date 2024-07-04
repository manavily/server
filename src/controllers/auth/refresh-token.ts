import type { Request, Response } from 'express';
import refreshToken from '../../services/auth/refresh-token';

export default function (req: Request, res: Response) {
  const result = refreshToken(req.body.refreshToken);
  res.status(result.code).json(result);
}
