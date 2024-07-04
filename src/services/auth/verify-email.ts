import database from '../../lib/database';

export default async function(token?: string) {
  const user = await database.user.findUnique({ where: { verificationToken: token } });
  if (!user) {
    return { code: 400, message: 'Invalid verification token' };
  }
  await database.user.update({ data: { emailVerified: true, verificationToken: null }, where: { id: user.id } });
  return { code: 200, message: 'Email verified successfully' };
}
