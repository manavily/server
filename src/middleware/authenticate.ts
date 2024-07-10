import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../lib/token";
import ResponseError from "../utils/response-error";

export default function (req: Request, res: Response, next: NextFunction) {
  if (!req.headers.authorization) {
    throw new ResponseError(401, "Authorization header is required");
  }
  const token = req.headers.authorization.split(" ")[1];
  const payload = verifyToken(token, process.env.JWT_SECRET_KEY as string);
  if (!payload) {
    throw new ResponseError(401, "Invalid access token");
  }
  (req as Request & { user: string | JwtPayload }).user = payload;
  next();
}
