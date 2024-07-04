import { generateToken, verifyRefreshToken } from "../../lib/token";

export default function (refreshToken: string) {
  if (!refreshToken) {
    return { code: 400, message: 'Refresh token is required' };
  }
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    return { code: 401, message: 'Invalid refresh token' };
  }
  const newToken = generateToken({ username: (payload as {username: string}).username });
  return { code: 200, token: newToken }
}