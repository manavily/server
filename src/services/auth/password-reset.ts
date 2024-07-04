import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import database from '../../lib/database';
import { sendResetPasswordEmail } from '../../lib/email';

async function request(email: string) {
  const user = await database.user.findUnique({ where: { email } });
  if (!user) {
    return { code: 404, message: 'User not found' };
  }
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date();
  resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token valid for 1 hour
  await database.user.update({ data: { resetPasswordToken: resetToken, resetPasswordTokenExpiry: resetTokenExpiry }, where: { email } });
  await sendResetPasswordEmail(email, resetToken);
  return { code: 200, message: 'Password reset email sent' }
}

async function passwordReset(password: string, token: string) {
  const user = await database.user.findUnique({ where: { resetPasswordToken: token } });
  if (!user) {
    return { code: 400, message: 'Invalid or expired token' };
  }
  if (user.resetPasswordTokenExpiry && user.resetPasswordTokenExpiry < new Date()) {
    return { code: 400, message: 'Token has expired' };
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  await database.user.update({ data: { password: hashedPassword, resetPasswordToken: null, resetPasswordTokenExpiry: null }, where: { id: user.id } });
  return { code: 200, message: 'Password has been reset' };
}

export default Object.assign(passwordReset, {request});
