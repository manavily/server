import { Router, type Request, type Response } from "express";
import authRoute from "./auth";
import authenticate from "../middleware/authenticate";
import authorize from "../middleware/authorize";

const route = Router();

route.get("/admin", authenticate, authorize(["ADMIN"]), (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome, ADMIN!" });
});
route.get("/profile", authenticate, authorize(["ADMIN", "USER"]), (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome, User!" });
});

route.use(authRoute);

export default route;
