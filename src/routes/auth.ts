import {Router} from "express";
import authController from "../controllers/auth";
import authenticate from "../middleware/authenticate";
import rateLimiter from "../middleware/rate-limiter";

const route = Router();

route.get("/verify-email", authController.verifyEmail);
route.post("/refresh-token", authenticate, authController.refreshToken);
route.post("/reset-password", authController.resetPassword);
route.post("/reset-password-request", authController.resetPasswordRequest);
route.post("/signin", rateLimiter, authController.signIn);
route.post("/signout", authenticate, authController.signOut);
route.post("/signup", rateLimiter, authController.signUp);
route.post("/two-factor-setup", authenticate, authController.twoFactorSetup);
route.post("/two-factor-verify", authenticate, authController.twoFactorVerify);

export default route;
