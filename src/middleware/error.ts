import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import ResponseError from "../utils/response-error";

export default function (error: Error, req: Request, res: Response, next: NextFunction) {
  if (error instanceof ZodError) {
    res.status(400).json(error);
  } else if (error instanceof ResponseError) {
    res.status(error.status).json({ message: error.message });
  } else {
    res.status(500).json({ message: "Internal server error" });
  }
  next();
}
