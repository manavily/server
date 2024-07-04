import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import database from '../../lib/database';
import { sendVerificationEmail } from '../../lib/email';

export default async function(email: string, password: string, role: 'ADMIN' | 'USER', username: string) {
  try {
    const existingUser = await database.user.findUnique({where: { username }});
    if (existingUser) {
      return { code: 400, message: 'Username already exists' };
    }
    const verificationToken = uuidv4();
    const newUser = await database.user.create({data: {email, password: bcrypt.hashSync(password, 10), role, username, verificationToken}});
    await sendVerificationEmail(email, verificationToken);
    return { code: 201, message: 'User registered successfully. Please check your email to verify your account', user: { role: newUser.role, username: newUser.username } };
  } catch (error) {
    console.error('Error in sign up:', error);
    if (error instanceof Error) {
      throw new Error(`Server error: ${error.message}`);
    } else {
      throw new Error('Unknown server error');
    }
  }
}
