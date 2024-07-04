import { generateTwoFactorSecret, verifyTwoFactorToken } from '../../lib/two-factor';

async function setup(id: number) {
  try {
    const { secret, qrCodeUrl } = await generateTwoFactorSecret(id);
    return { code: 200, qrCodeUrl, secret };
  } catch (error) {
    console.error('Error in two factor setup:', error);
    if (error instanceof Error) {
      throw new Error(`Server error: ${error.message}`);
    } else {
      throw new Error('Unknown server error');
    }
  }
}

async function verify(id: number, token: string) {
  try {
    const isValid = await verifyTwoFactorToken(id, token);
    if (isValid) {
      return { code: 200, message: '2FA verified successfully' };
    } else {
      return { code: 401, message: 'Invalid 2FA token' };
    }
  } catch (error) {
    console.error('Error in two factor verify:', error);
    if (error instanceof Error) {
      throw new Error(`Server error: ${error.message}`);
    } else {
      throw new Error('Unknown server error');
    }
  }
}

export default {setup, verify};
