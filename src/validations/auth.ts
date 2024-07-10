import { z, type ZodType } from "zod";

const refreshTokenValidation: ZodType = z.object({
  token: z.string({ required_error: "Refresh token is required" }).min(1),
});

const resetPasswordValidation: ZodType = z.object({
  password: z.string().min(8),
  token: z.string({ required_error: "Token is required" }).min(1),
});

const resetPasswordRequestValidation: ZodType = z.object({
  email: z.string().email("Please provide a valid email address").min(1),
});

const signInValidation: ZodType = z.object({
  password: z.string().min(8),
  username: z.string().min(1).max(100),
});

const signUpValidation: ZodType = z.object({
  email: z.string().email().min(3),
  password: z.string().min(8),
  username: z.string().min(1),
});

const twoFactorSetupValidation: ZodType = z.object({
  id: z.number(),
});

const twoFactorVerifyValidation: ZodType = z.object({
  password: z.string().min(8),
  token: z.string({ required_error: "Token is required" }).min(1),
});

const verifyEmailValidation: ZodType = z.object({
  token: z.string({ required_error: "Verification token is required" }).min(1),
});

export default {
  refreshToken: refreshTokenValidation,
  resetPassword: resetPasswordValidation,
  resetPasswordRequest: resetPasswordRequestValidation,
  signIn: signInValidation,
  signUp: signUpValidation,
  twoFactorSetup: twoFactorSetupValidation,
  twoFactorVerify: twoFactorVerifyValidation,
  verifyEmail: verifyEmailValidation,
};
