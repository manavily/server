import type { User } from "@prisma/client";
import { z } from "zod";
import authValidation from "../validations/auth";

export interface AuthModel {
  refreshTokenRequest: z.infer<typeof authValidation.refreshToken>;
  refreshTokenResponse: { json: { message: string; token: string }; status: 200 };
  resetPasswordRequest: z.infer<typeof authValidation.resetPassword>;
  resetPasswordResponse: { json: { message: string }; status: 200 };
  resetPasswordRequestRequest: z.infer<typeof authValidation.resetPasswordRequest>;
  resetPasswordRequestResponse: { json: { data: { email: string }; message: string }; status: 200 };
  signInRequest: z.infer<typeof authValidation.signIn>;
  signInResponse: {
    json: {
      data: { created_at: Date; email: string; role: string; updated_at: Date; username: string };
      message: string;
      token: { access: string; refresh: string };
    };
    status: 200;
  };
  signUpRequest: z.infer<typeof authValidation.signUp>;
  signUpResponse: { json: { data: { email: string; username: string }; message: string }; status: 201 };
  twoFactorSetupRequest: z.infer<typeof authValidation.twoFactorSetup>;
  twoFactorSetupResponse: { json: { data: { qr_code_url: string; secret: string }; message: string }; status: 200 };
  twoFactorVerifyRequest: z.infer<typeof authValidation.twoFactorVerify>;
  twoFactorVerifyResponse: { json: { message: string; valid: boolean }; status: 200 };
  verifyEmailRequest: z.infer<typeof authValidation.verifyEmail>;
  verifyEmailResponse: { json: { data: { email: string }; message: string }; status: 200 };
}

function refreshTokenResponse(data: string, message: string, status: 200): AuthModel["refreshTokenResponse"] {
  return { json: { message, token: data }, status };
}
function resetPasswordResponse(message: string, status: 200): AuthModel["resetPasswordResponse"] {
  return { json: { message }, status };
}
function resetPasswordRequestResponse(data: User, message: string, status: 200): AuthModel["resetPasswordRequestResponse"] {
  return { json: { data: { email: data.email }, message }, status };
}
function signInResponse(data: User, message: string, status: 200, token: { access: string; refresh: string }): AuthModel["signInResponse"] {
  return {
    json: {
      data: { created_at: data.createdAt, email: data.email, role: data.role, updated_at: data.updatedAt, username: data.username },
      message,
      token,
    },
    status,
  };
}
function signUpResponse(data: User, message: string, status: 201): AuthModel["signUpResponse"] {
  return { json: { data: { email: data.email, username: data.username }, message }, status };
}
function twoFactorSetupResponse(data: { qr_code_url: string; secret: string }, message: string, status: 200): AuthModel["twoFactorSetupResponse"] {
  return { json: { data, message }, status };
}
function twoFactorVerifyResponse(data: boolean, message: string, status: 200): AuthModel["twoFactorVerifyResponse"] {
  return { json: { message, valid: data }, status };
}
function verifyEmailResponse(data: User, message: string, status: 200): AuthModel["verifyEmailResponse"] {
  return { json: { data: { email: data.email }, message }, status };
}

export default {
  refreshToken: refreshTokenResponse,
  resetPassword: resetPasswordResponse,
  resetPasswordRequest: resetPasswordRequestResponse,
  signIn: signInResponse,
  signUp: signUpResponse,
  twoFactorSetup: twoFactorSetupResponse,
  twoFactorVerify: twoFactorVerifyResponse,
  verifyEmail: verifyEmailResponse,
};
