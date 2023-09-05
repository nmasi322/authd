import jsonwebtoken from "jsonwebtoken";
import User, { IUserDocument } from "./../models/user.model";
import { JWT } from "./../config";
import CustomError from "./../utils/custom-error";

import type { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
}
interface JWTPayload {
  id: string;
  iat: number;
  exp: number;
}

const auth = (requiresVerifiedEmail = true) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new CustomError("unauthorized access: Token not found", 401);
    }

    const token = authHeader.split(" ")[1];
    const cookieToken = req.cookies.__access;

    if (!cookieToken)
      throw new CustomError("unauthorized access: Token not found", 401);

    // Implementation allows for authorization to be read from req header and httpOnly cookie
    let decoded = null;

    try {
      // attempts to verify header token
      decoded = jsonwebtoken.verify(token, JWT.JWT_SECRET) as JWTPayload;
    } catch (err) {}

    // header token verifications failes ( decoded is stil null )
    if (decoded === null) {
      // attemps to verify cookie token
      try {
        if (cookieToken) {
          decoded = jsonwebtoken.verify(
            cookieToken,
            JWT.JWT_SECRET
          ) as JWTPayload;
        } else {
          // Cookie token undefined or missing
          throw new CustomError(
            "UnAuthorized Access: jsonwebtoken not provided",
            401
          );
        }
      } catch (err) {
        // Verification of token fails
        throw new CustomError(
          "UnAuthorized Access: Failed to verify jsonwebtoken",
          401
        );
      }
    }

    const user = await User.findOne({ _id: decoded.id });

    if (!user)
      throw new CustomError("unauthorized access: User does not exist", 401);

    if (!user.isVerified && requiresVerifiedEmail)
      throw new CustomError(
        "unauthorized access: Please verify email address",
        401
      );

    req.user = user;
    next();
  };
};

export default auth;
