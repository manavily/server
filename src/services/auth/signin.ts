import bcrypt from 'bcryptjs';
import database from '../../lib/database';
import { generateRefreshToken, generateToken } from '../../lib/token';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

export default async function(username: string, password: string) {
  try {
    const user = await database.user.findUnique({where: {username}});
    if (!user) {
      return { code: 400, message: 'Invalid username or password' };
    }
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const lockoutTimeLeft = (user.lockoutUntil.getTime() - new Date().getTime()) / 1000;
      return { code: 403, message: `Account is locked. Try again in ${Math.ceil(lockoutTimeLeft / 60)} minutes.` };
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      const failedAttempts = user.failedAttempts + 1;
      const lockoutUntil = failedAttempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_DURATION) : null;
      await database.user.update({ data: { failedAttempts, lockoutUntil }, where: { id: user.id } });
      const lockoutMessage = lockoutUntil
        ? `Account is locked due to too many failed attempts. Try again in ${LOCKOUT_DURATION / (60 * 1000)} minutes.`
        : 'Invalid username or password';

      return { code: 400, message: lockoutMessage };
    }
    await database.user.update({ data: { failedAttempts: 0, lockoutUntil: null }, where: { id: user.id } });
    if (user && isPasswordValid) {
      const token = generateToken({ id: user.id, role: user.role, username: user.username });
      const refreshToken = generateRefreshToken({ id: user.id, role: user.role, username: user.username });
      return { code: 200, message: 'Sign-in successful', refreshToken, token, user: { id: user.id, username: user.username, role: user.role } }
    } else {
      return { code: 401, message: 'Invalid credentials' }
    }
  } catch (error) {
    console.error('Error in sign in:', error);
    if (error instanceof Error) {
      throw new Error(`Server error: ${error.message}`);
    } else {
      throw new Error('Unknown server error');
    }
  }
}
