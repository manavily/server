import qrcode from 'qrcode';
import speakeasy from 'speakeasy';
import database from './database';

export async function generateTwoFactorSecret(id: number) {
  const secret = speakeasy.generateSecret({ name: process.env.APPLICATION_NAME });
  await database.user.update({ data: { twoFactorSecret: secret.base32 }, where: {id}});
  const qrCodeUrl = qrcode.toDataURL(secret.otpauth_url as string);
  return { qrCodeUrl, secret: secret.base32 };
};

export async function verifyTwoFactorToken(id: number, token: string) {
  const user = await database.user.findUnique({ where: { id } });
  if (!user || !user.twoFactorSecret) {
    return false;
  }
  return speakeasy.totp.verify({ encoding: 'base32', secret: user.twoFactorSecret, token });
};
