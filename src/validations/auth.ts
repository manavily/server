import {z, type ZodType} from "zod";

const refreshTokenValidation: ZodType = z.object({
  token: z.string({required_error: "Refresh token is required"}).min(1),
});

const resetPasswordValidation: ZodType = z.object({
  password: z.string().min(8),
  token: z.string({required_error: "Token is required"}).min(1),
});

const resetPasswordRequestValidation: ZodType = z.object({
  email: z.string().email("Please provide a valid email address").min(1),
});

const signInValidation: ZodType = z.object({
  password: z.string().min(8),
  username: z.string().min(1).max(100),
});

const signOutValidation: ZodType<{token: string}> = z.object({
  token: z.string({required_error: "Token is required"}).min(1),
});

const signUpValidation: ZodType<{email: string; password: string; username: string}> = z.object({
  email: z.string().email().min(3),
  password: z.string().min(8),
  username: z.string().min(1),
});

const twoFactorSetupValidation: ZodType = z.object({
  id: z.number(),
});

const twoFactorVerifyValidation: ZodType = z.object({
  password: z.string().min(8),
  token: z.string({required_error: "Token is required"}).min(1),
});

const verifyEmailValidation: ZodType = z.object({
  token: z.string({required_error: "Verification token is required"}).min(1),
});

export interface AuthValidation {
  refreshToken: z.infer<typeof refreshTokenValidation>;
  resetPassword: z.infer<typeof resetPasswordValidation>;
  resetPasswordRequest: z.infer<typeof resetPasswordValidation>;
  signIn: z.infer<typeof signInValidation>;
  signOut: z.infer<typeof signOutValidation>;
  signUp: z.infer<typeof signUpValidation>;
  twoFactorSetup: z.infer<typeof twoFactorSetupValidation>;
  twoFactorVerify: z.infer<typeof twoFactorVerifyValidation>;
  verifyEmail: z.infer<typeof verifyEmailValidation>;
}

export default {
  refreshToken: refreshTokenValidation,
  resetPassword: resetPasswordValidation,
  resetPasswordRequest: resetPasswordRequestValidation,
  signIn: signInValidation,
  signOut: signOutValidation,
  signUp: signUpValidation,
  twoFactorSetup: twoFactorSetupValidation,
  twoFactorVerify: twoFactorVerifyValidation,
  verifyEmail: verifyEmailValidation,
};
