import jwt from "jsonwebtoken";

export function generateToken(payload: object, key: string, options?: jwt.SignOptions) {
  return jwt.sign(payload, key, options);
}

export function verifyToken(token: string, key: string) {
  return jwt.verify(token, key);
}
