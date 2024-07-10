import type { NextFunction, Request, Response } from "express";
import ResponseError from "../utils/response-error";

export default function (roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes((req as Request & { user: { role: "administrator" | "user" } }).user.role)) {
      throw new ResponseError(403, "Forbidden");
    }
    next();
  };
}
