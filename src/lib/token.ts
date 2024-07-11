import {User} from "@prisma/client";
import jwt from "jsonwebtoken";

export function generateToken(payload: object, key: string, options?: jwt.SignOptions): string {
  return jwt.sign(payload, key, options);
}

export async function generateAuthTokens(user: User) {
  const accessTokenExpires = (process.env.JWT_ACCESS_EXPIRATION_MINUTES as unknown as number) * 60000; //minutes
  const accessToken = generateToken(user, process.env.JWT_SECRET_KEY as string, {expiresIn: accessTokenExpires});
  const refreshTokenExpires = (process.env.JWT_REFRESH_EXPIRATION_DAYS as unknown as number) * 86400000; // days
  const refreshToken = generateToken(user, process.env.JWT_SECRET_KEY as string, {expiresIn: refreshTokenExpires});
  return {
    access: {
      token: accessToken,
      expires: new Date(Date.now() + accessTokenExpires),
    },
    refresh: {
      expires: new Date(Date.now() + refreshTokenExpires),
      token: refreshToken,
    },
  };
}

export function verifyToken(token: string, key: string, options?: jwt.VerifyOptions & {complete?: false}): string | jwt.JwtPayload {
  return jwt.verify(token, key, options);
}
