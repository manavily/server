import {TypeToken} from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import qrcode from "qrcode";
import speakeasy from "speakeasy";
import database from "../lib/database";
import {generateAuthTokens, generateToken, verifyToken} from "../lib/token";
import authMail from "../mails/auth";
import authModel, {type AuthModel} from "../models/auth";
import ResponseError from "../utils/response-error";
import type {AuthValidation} from "../validations/auth";

async function refreshTokenService(request: AuthValidation["refreshToken"]): Promise<AuthModel["refreshToken"]> {
  const payload = verifyToken(request.token, process.env.JWT_REFRESH_SECRET_KEY as string);
  const user = await database.user.findUnique({where: {username: (payload as {username: string}).username}});
  if (!payload || !user) {
    throw new ResponseError(401, "Invalid refresh token");
  }
  const token = generateToken({id: user.id, role: user.role, username: user.username}, process.env.JWT_SECRET_KEY as string, {expiresIn: "1h"});
  return authModel.refreshToken(token, "", 200);
}

async function resetPasswordService(request: AuthValidation["resetPassword"]): Promise<AuthModel["resetPassword"]> {
  const existingToken = await database.token.findUnique({include: {user: true}, where: {token: request.token, type: TypeToken.RESET_PASSWORD}});
  if (!existingToken) {
    throw new ResponseError(400, "Invalid token");
  }
  if (existingToken.token && existingToken.expires < new Date()) {
    throw new ResponseError(400, "Token has expired");
  }
  request.password = await bcrypt.hash(request.password, 10);
  await database.token.delete({where: {id: existingToken.id}});
  await database.user.update({data: {password: request.password}, where: {id: existingToken.userId}});
  return authModel.resetPassword("Password has been reset", 200);
}

async function resetPasswordRequestService(request: AuthValidation["resetPasswordRequest"]): Promise<AuthModel["resetPasswordRequest"]> {
  const user = await database.user.findUnique({where: {email: request.email}});
  if (!user) {
    throw new ResponseError(404, "User with email address " + request.email + " does not exist");
  }
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date();
  expires.setHours(expires.getHours() + 1); // Token valid for 1 hour
  await database.user.update({data: {tokens: {create: {blacklisted: false, expires, token, type: TypeToken.RESET_PASSWORD}}}, where: {email: request.email}});
  await authMail.resetPassword(request.email, token);
  return authModel.resetPasswordRequest(user, "Password reset email sent", 200);
}

async function signInService(request: AuthValidation["signIn"]): Promise<AuthModel["signIn"]> {
  const user = await database.user.findUnique({where: {username: request.username}});
  if (!user) {
    throw new ResponseError(400, "Invalid credentials");
  }
  if (user.lockoutUntil && user.lockoutUntil > new Date()) {
    const lockoutTimeLeft = (user.lockoutUntil.getTime() - new Date().getTime()) / 1000;
    throw new ResponseError(403, "Account is locked. Try again in " + Math.ceil(lockoutTimeLeft / 60) + " minutes.");
  }
  if (!bcrypt.compareSync(request.password, user.password)) {
    const maxFailedAttempts = 5;
    const lockoutDuration = 5 * 60 * 1000; // 5 minutes
    const failedAttempts = user.failedAttempts + 1;
    const lockoutUntil = failedAttempts >= maxFailedAttempts ? new Date(Date.now() + lockoutDuration) : null;
    await database.user.update({data: {failedAttempts, lockoutUntil}, where: {id: user.id}});
    throw new ResponseError(
      400,
      lockoutUntil ? "Account is locked due to too many failed attempts. Try again in " + lockoutDuration / (60 * 1000) + " minutes." : "Invalid credentials",
    );
  }
  const tokens = await generateAuthTokens(user);
  await database.user.update({
    data: {
      failedAttempts: 0,
      lockoutUntil: null,
      tokens: {
        deleteMany: {userId: user.id},
        createMany: {
          data: [
            {blacklisted: false, expires: tokens.access.expires, token: tokens.access.token, type: TypeToken.ACCESS},
            {blacklisted: false, expires: tokens.refresh.expires, token: tokens.refresh.token, type: TypeToken.REFRESH},
          ],
        },
      },
    },
    where: {id: user.id},
  });
  return authModel.signIn(user, "Sign-in successful", 200);
}

async function signOutService(request: AuthValidation["signOut"]): Promise<AuthModel["signOut"]> {
  const refreshToken = await database.token.findUnique({where: {blacklisted: false, token: request.token, type: TypeToken.REFRESH}});
  if (!refreshToken) {
    throw new ResponseError(404, "Not found");
  }
  await database.token.delete({where: {id: refreshToken.id}});
  return authModel.signOut("Successfully signed out", 204);
}

async function signUpService(request: AuthValidation["signUp"]): Promise<AuthModel["signUp"]> {
  const countUsername = await database.user.count({where: {username: request.username}});
  const countEmail = await database.user.count({where: {email: request.email}});
  if (countEmail !== 0) {
    throw new ResponseError(400, "Email already exists");
  }
  if (countUsername !== 0) {
    throw new ResponseError(400, "Username already exists");
  }
  request.password = await bcrypt.hash(request.password, 10);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const token = crypto.randomBytes(32).toString("hex");
  const user = await database.user.create({
    data: {...request, tokens: {create: {blacklisted: false, expires, token, type: TypeToken.VERIFY_EMAIL}}},
  });
  await authMail.verificationEmail(user.email, token);
  return authModel.signUp(user, "User registered successfully. Please check your email to verify your account", 201);
}

async function twoFactorSetupService(request: AuthValidation["twoFactorSetup"]): Promise<AuthModel["twoFactorSetup"]> {
  const {base32, otpauth_url} = speakeasy.generateSecret({name: process.env.APPLICATION_NAME});
  const qr_code_url = await qrcode.toDataURL(otpauth_url as string);
  await database.user.update({data: {twoFactorSecret: base32}, where: {id: request.id}});
  return authModel.twoFactorSetup({qr_code_url, secret: base32}, "", 200);
}

async function twoFactorVerifyService(request: AuthValidation["twoFactorVerify"]): Promise<AuthModel["twoFactorVerify"]> {
  const user = await database.user.findUnique({where: {id: request.id}});
  if (!user || !user.twoFactorSecret) {
    throw new ResponseError(404, "User does not exist or Two factor authentication not set up");
  }
  const valid = speakeasy.totp.verify({encoding: "base32", secret: user.twoFactorSecret, token: request.token});
  if (!valid) {
    throw new ResponseError(401, "Invalid Two factor authentication token");
  }
  await database.user.update({data: {twoFactorSecret: null}, where: {id: request.id}});
  return authModel.twoFactorVerify(valid, "Two factor authentication verified successfully", 200);
}

async function verifyEmailService(request: AuthValidation["verifyEmail"]): Promise<AuthModel["verifyEmail"]> {
  const existingToken = await database.token.findUnique({include: {user: true}, where: {token: request.token}});
  if (!existingToken || existingToken.type !== TypeToken.VERIFY_EMAIL || existingToken.expires < new Date()) {
    throw new ResponseError(400, "Invalid email verification token");
  }
  await database.user.update({data: {emailVerified: true}, where: {id: existingToken.userId}});
  await database.token.delete({where: {id: existingToken.id}});
  return authModel.verifyEmail(existingToken.user, "Email verified successfully", 200);
}

export default {
  refreshToken: refreshTokenService,
  resetPassword: resetPasswordService,
  resetPasswordRequest: resetPasswordRequestService,
  signIn: signInService,
  signOut: signOutService,
  signUp: signUpService,
  twoFactorSetup: twoFactorSetupService,
  twoFactorVerify: twoFactorVerifyService,
  verifyEmail: verifyEmailService,
};
