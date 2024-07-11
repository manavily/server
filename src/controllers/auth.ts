import type {Request, Response, NextFunction} from "express";
import validation from "../lib/validation";
import authService from "../services/auth";
import authValidation from "../validations/auth";

async function refreshTokenController(req: Request, res: Response, next: NextFunction) {
  try {
    const request = validation(authValidation.refreshToken, req.body);
    const {json, status} = await authService.refreshToken(request);
    res.status(status).json(json);
  } catch (e) {
    next(e);
  }
}

async function resetPasswordController(req: Request, res: Response, next: NextFunction) {
  try {
    const request = validation(authValidation.resetPassword, req.body);
    const {json, status} = await authService.resetPassword(request);
    res.status(status).json(json);
  } catch (e) {
    next(e);
  }
}

async function resetPasswordRequestController(req: Request, res: Response, next: NextFunction) {
  try {
    const request = validation(authValidation.resetPasswordRequest, req.body);
    const {json, status} = await authService.resetPasswordRequest(request);
    res.status(status).json(json);
  } catch (e) {
    next(e);
  }
}

async function signInController(req: Request, res: Response, next: NextFunction) {
  try {
    const request = validation(authValidation.signIn, req.body);
    const {json, status} = await authService.signIn(request);
    // if (status === 200) {
    //   res.cookie("token", json.data.access.token, {httpOnly: true, secure: true, sameSite: "strict"});
    // }
    res.status(status).json(json);
  } catch (e) {
    next(e);
  }
}

async function signOutController(req: Request, res: Response, next: NextFunction) {
  try {
    const request = validation(authValidation.signOut, req.body);
    const {json, status} = await authService.signOut(request);
    if (status === 204) {
      res.clearCookie("token", {httpOnly: true, secure: true, sameSite: "strict"});
    }
    res.status(status).json(json);
  } catch (e) {
    next(e);
  }
}

async function signUpController(req: Request, res: Response, next: NextFunction) {
  try {
    const request = validation(authValidation.signUp, req.body);
    const {json, status} = await authService.signUp(request);
    res.status(status).json(json);
  } catch (e) {
    next(e);
  }
}

async function twoFactorSetupController(req: Request, res: Response, next: NextFunction) {
  try {
    const request = validation(authValidation.twoFactorSetup, req.body);
    const {json, status} = await authService.twoFactorSetup(request);
    res.status(status).json(json);
  } catch (e) {
    next(e);
  }
}

async function twoFactorVerifyController(req: Request, res: Response, next: NextFunction) {
  try {
    const request = validation(authValidation.twoFactorVerify, req.body);
    const {json, status} = await authService.twoFactorVerify(request);
    res.status(status).json(json);
  } catch (e) {
    next(e);
  }
}

async function verifyEmailController(req: Request, res: Response, next: NextFunction) {
  try {
    const request = validation(authValidation.verifyEmail, req.query);
    const {json, status} = await authService.verifyEmail(request);
    res.status(status).json(json);
  } catch (e) {
    next(e);
  }
}

export default {
  refreshToken: refreshTokenController,
  resetPassword: resetPasswordController,
  resetPasswordRequest: resetPasswordRequestController,
  signIn: signInController,
  signOut: signOutController,
  signUp: signUpController,
  twoFactorSetup: twoFactorSetupController,
  twoFactorVerify: twoFactorVerifyController,
  verifyEmail: verifyEmailController,
};
