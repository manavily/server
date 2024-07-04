import { Router, type Request, type Response } from 'express';
import { body } from 'express-validator';
import passwordReset from '../controllers/auth/password-reset';
import refreshToken from '../controllers/auth/refresh-token';
import signin from '../controllers/auth/signin';
import signup from '../controllers/auth/signup';
import verifyEmail from '../controllers/auth/verify-email';
import twoFactor from '../controllers/auth/two-factor';
import authenticate from '../middleware/authenticate';
import authorize from '../middleware/authorize';
import rateLimiter from '../middleware/rate-limiter';

const router = Router();

router.get('/admin', authenticate, authorize(['ADMIN']), (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome, ADMIN!' });
});
router.get('/profile', authenticate, authorize(['ADMIN', 'USER']), (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome, User!' });
});
router.get('/verify-email', verifyEmail);

router.post('/password-reset', [body('token').notEmpty().withMessage('Token is required'), body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')], passwordReset);
router.post('/password-reset-request', body('email').isEmail().withMessage('Please provide a valid email address'), passwordReset.request);
router.post('/refresh-token', refreshToken);
router.post('/signin', rateLimiter, signin);
router.post('/signup', rateLimiter, signup);
router.post('/two-factor-authentication/setup', authenticate, twoFactor.setup);
router.post('/two-factor-authentication/verify', authenticate, twoFactor.verify);

export default router;
