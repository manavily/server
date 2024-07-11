// Token,
import type {User} from "@prisma/client";

export interface AuthModel {
  refreshToken: {json: {message: string; token: string}; status: 200};
  resetPassword: {json: {message: string}; status: 200};
  resetPasswordRequest: {json: {data: {email: string}; message: string}; status: 200};
  signIn: {
    json: {
      data: {
        // access: {expires: Date; token: string};
        created_at: Date;
        email: string;
        // refresh: {expires: Date; token: string};
        role: string;
        updated_at: Date;
        username: string;
      };
      message: string;
    };
    status: 200;
  };
  signOut: {json: {message: string}; status: 204};
  signUp: {json: {data: {email: string; username: string}; message: string}; status: 201};
  twoFactorSetup: {json: {data: {qr_code_url: string; secret: string}; message: string}; status: 200};
  twoFactorVerify: {json: {message: string; valid: boolean}; status: 200};
  verifyEmail: {json: {data: {email: string}; message: string}; status: 200};
}

function refreshTokenResponse(data: string, message: string, status: 200): AuthModel["refreshToken"] {
  return {json: {message, token: data}, status};
}
function resetPasswordResponse(message: string, status: 200): AuthModel["resetPassword"] {
  return {json: {message}, status};
}
function resetPasswordRequestResponse(data: User, message: string, status: 200): AuthModel["resetPasswordRequest"] {
  return {json: {data: {email: data.email}, message}, status};
}
// {access: Pick<Token, "expires" | "token">; refresh: Pick<Token, "expires" | "token">} &
function signInResponse(data: User, message: string, status: 200): AuthModel["signIn"] {
  return {
    json: {
      data: {
        // access: {expires: data.access.expires, token: data.access.token},
        created_at: data.createdAt,
        email: data.email,
        // refresh: {expires: data.refresh.expires, token: data.refresh.token},
        role: data.role,
        updated_at: data.updatedAt,
        username: data.username,
      },
      message,
    },
    status,
  };
}
function signOutResponse(message: string, status: 204): AuthModel["signOut"] {
  return {json: {message}, status};
}
function signUpResponse(data: User, message: string, status: 201): AuthModel["signUp"] {
  return {json: {data: {email: data.email, username: data.username}, message}, status};
}
function twoFactorSetupResponse(data: {qr_code_url: string; secret: string}, message: string, status: 200): AuthModel["twoFactorSetup"] {
  return {json: {data, message}, status};
}
function twoFactorVerifyResponse(data: boolean, message: string, status: 200): AuthModel["twoFactorVerify"] {
  return {json: {message, valid: data}, status};
}
function verifyEmailResponse(data: User, message: string, status: 200): AuthModel["verifyEmail"] {
  return {json: {data: {email: data.email}, message}, status};
}

export default {
  refreshToken: refreshTokenResponse,
  resetPassword: resetPasswordResponse,
  resetPasswordRequest: resetPasswordRequestResponse,
  signIn: signInResponse,
  signOut: signOutResponse,
  signUp: signUpResponse,
  twoFactorSetup: twoFactorSetupResponse,
  twoFactorVerify: twoFactorVerifyResponse,
  verifyEmail: verifyEmailResponse,
};
