import type { Request } from "express";
import { IUserDocument } from "../models/user.model";

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}
export interface JWTPayload {
  id: string;
  iat: number;
  exp: number;
}
export interface RefreshTokenInput {
  refreshToken: string;
}

export interface LogoutInput {
  refreshToken: string;
}
export interface JWTPayload {
  id: string;
  iat: number;
  exp: number;
}
export interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
}
export interface VerifyEmailInput {
  userId: string;
  otp: string;
}

export interface ResetPasswordInput {
  tokenId: string;
  resetToken: string;
  password: string;
}

export interface UpdatePasswordInput {
  oldPassword: string;
  newPassword: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
}
