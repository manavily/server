import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import passwordResetService from '../../services/auth/password-reset';

async function passwordReset(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const result = await passwordResetService(req.body.password, req.body.token);
    res.status(result.code).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Unknown server error' });
    }
  }
}

async function request(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  }
  try {
    const result = await passwordResetService.request(req.body.email);
    res.status(result.code).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Unknown server error' });
    }
  }
}

export default Object.assign(passwordReset, {request});
