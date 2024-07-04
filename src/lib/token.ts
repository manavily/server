import jwt from 'jsonwebtoken';

export function generateRefreshToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET_KEY as string, { expiresIn: '7d' });
};

export function generateToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY as string, { expiresIn: '1h' });
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY as string);
  } catch (error) {
    console.error(error);
    return null;
  }
};

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_KEY  as string);
  } catch (error) {
    console.error(error);
    return null;
  }
};
