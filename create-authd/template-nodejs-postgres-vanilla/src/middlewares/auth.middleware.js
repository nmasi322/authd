import jsonwebtoken from "jsonwebtoken";
import User from "./../models/user.model.js";
import { JWT } from "./../config/config.js";
import CustomError from "./../utils/custom-error.js";

const auth = (requiresVerifiedEmail = true) => {
  return async (req, res, next) => {
    const token = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : "";
    const cookieToken = req.cookies.__access;

    if (!token && !cookieToken)
      throw new CustomError("unauthorized access: Token not found", 401);

    // Implementation allows for authorization to be read from req header and httpOnly cookie
    let decoded = null;

    try {
      // attempts to verify header token
      decoded = jsonwebtoken.verify(token, JWT.JWT_SECRET);
    } catch (err) {}

    // header token verifications failes ( decoded is stil null )
    if (decoded === null) {
      // attemps to verify cookie token
      try {
        if (cookieToken) {
          decoded = jsonwebtoken.verify(cookieToken, JWT.JWT_SECRET);
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

    const user = await User.findOne({ where: { id: decoded.id } });

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
