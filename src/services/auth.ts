import bcrypt from "bcrypt";
import crypto from "crypto";
import qrcode from "qrcode";
import speakeasy from "speakeasy";
import { v4 as uuid } from "uuid";
import database from "../lib/database";
import { generateToken, verifyToken } from "../lib/token";
import authMail from "../mails/auth";
import authModel, { type AuthModel } from "../models/auth";
import ResponseError from "../utils/response-error";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

async function refreshTokenService(request: AuthModel["refreshTokenRequest"]): Promise<AuthModel["refreshTokenResponse"]> {
  const payload = verifyToken(request.token, process.env.JWT_REFRESH_SECRET_KEY as string);
  const user = await database.user.findUnique({ where: { username: (payload as { username: string }).username } });
  if (!payload || !user) {
    throw new ResponseError(401, "Invalid refresh token");
  }
  const token = generateToken({ id: user.id, role: user.role, username: user.username }, process.env.JWT_SECRET_KEY as string, { expiresIn: "1h" });
  return authModel.refreshToken(token, "", 200);
}

async function resetPasswordService(request: AuthModel["resetPasswordRequest"]): Promise<AuthModel["resetPasswordResponse"]> {
  const user = await database.user.findUnique({ where: { resetPasswordToken: request.token } });
  if (!user) {
    throw new ResponseError(400, "Invalid token");
  }
  if (user.resetPasswordTokenExpiry && user.resetPasswordTokenExpiry < new Date()) {
    throw new ResponseError(400, "Token has expired");
  }
  request.password = await bcrypt.hash(request.password, 10);
  await database.user.update({ data: { password: request.password, resetPasswordToken: null, resetPasswordTokenExpiry: null }, where: { id: user.id } });
  return authModel.resetPassword("Password has been reset", 200);
}

async function resetPasswordRequestService(request: AuthModel["resetPasswordRequestRequest"]): Promise<AuthModel["resetPasswordRequestResponse"]> {
  const user = await database.user.findUnique({ where: { email: request.email } });
  if (!user) {
    throw new ResponseError(404, "User with email address " + request.email + " does not exist");
  }
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date();
  resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token valid for 1 hour
  await database.user.update({ data: { resetPasswordToken: resetToken, resetPasswordTokenExpiry: resetTokenExpiry }, where: { email: request.email } });
  await authMail.resetPassword(request.email, resetToken);
  return authModel.resetPasswordRequest(user, "Password reset email sent", 200);
}

async function signInService(request: AuthModel["signInRequest"]): Promise<AuthModel["signInResponse"]> {
  const user = await database.user.findUnique({ where: { username: request.username } });
  if (!user) {
    throw new ResponseError(400, "Invalid credentials");
  }
  if (user.lockoutUntil && user.lockoutUntil > new Date()) {
    const lockoutTimeLeft = (user.lockoutUntil.getTime() - new Date().getTime()) / 1000;
    throw new ResponseError(403, "Account is locked. Try again in " + Math.ceil(lockoutTimeLeft / 60) + " minutes.");
  }
  if (!bcrypt.compareSync(request.password, user.password)) {
    const failedAttempts = user.failedAttempts + 1;
    const lockoutUntil = failedAttempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_DURATION) : null;
    await database.user.update({ data: { failedAttempts, lockoutUntil }, where: { id: user.id } });
    throw new ResponseError(
      400,
      lockoutUntil ? "Account is locked due to too many failed attempts. Try again in " + LOCKOUT_DURATION / (60 * 1000) + " minutes." : "Invalid credentials",
    );
  }
  await database.user.update({ data: { failedAttempts: 0, lockoutUntil: null }, where: { id: user.id } });
  const access = generateToken({ id: user.id, role: user.role, username: user.username }, process.env.JWT_SECRET_KEY as string);
  const refresh = generateToken({ username: user.username }, process.env.JWT_REFRESH_SECRET_KEY as string);
  return authModel.signIn(user, "Sign-in successful", 200, { access, refresh });
}

async function signUpService(request: AuthModel["signUpRequest"]): Promise<AuthModel["signUpResponse"]> {
  const countUsername = await database.user.count({ where: { username: request.username } });
  if (countUsername !== 0) {
    throw new ResponseError(400, "Username already exists");
  }
  request.password = await bcrypt.hash(request.password, 10);
  const token = uuid();
  const user = await database.user.create({ data: { ...request, verificationToken: token } });
  await authMail.verificationEmail(request.email, token);
  return authModel.signUp(user, "User registered successfully. Please check your email to verify your account", 201);
}

async function twoFactorSetupService(request: AuthModel["twoFactorSetupRequest"]): Promise<AuthModel["twoFactorSetupResponse"]> {
  const { base32, otpauth_url } = speakeasy.generateSecret({ name: process.env.APPLICATION_NAME });
  const qr_code_url = await qrcode.toDataURL(otpauth_url as string);
  await database.user.update({ data: { twoFactorSecret: base32 }, where: { id: request.id } });
  return authModel.twoFactorSetup({ qr_code_url, secret: base32 }, "", 200);
}

async function twoFactorVerifyService(request: AuthModel["twoFactorVerifyRequest"]): Promise<AuthModel["twoFactorVerifyResponse"]> {
  const user = await database.user.findUnique({ where: { id: request.id } });
  if (!user || !user.twoFactorSecret) {
    throw new ResponseError(404, "User does not exist or Two factor authentication not set up");
  }
  const valid = speakeasy.totp.verify({ encoding: "base32", secret: user.twoFactorSecret, token: request.token });
  if (!valid) {
    throw new ResponseError(401, "Invalid Two factor authentication token");
  }
  return authModel.twoFactorVerify(valid, "Two factor authentication verified successfully", 200);
}

async function verifyEmailService(request: AuthModel["verifyEmailRequest"]): Promise<AuthModel["verifyEmailResponse"]> {
  const user = await database.user.findUnique({ where: { verificationToken: request.token } });
  if (!user) {
    throw new ResponseError(400, "Invalid verification token");
  }
  await database.user.update({ data: { emailVerified: true, verificationToken: null }, where: { id: user.id } });
  return authModel.verifyEmail(user, "Email verified successfully", 200);
}

export default {
  refreshToken: refreshTokenService,
  resetPassword: resetPasswordService,
  resetPasswordRequest: resetPasswordRequestService,
  signIn: signInService,
  signUp: signUpService,
  twoFactorSetup: twoFactorSetupService,
  twoFactorVerify: twoFactorVerifyService,
  verifyEmail: verifyEmailService,
};
