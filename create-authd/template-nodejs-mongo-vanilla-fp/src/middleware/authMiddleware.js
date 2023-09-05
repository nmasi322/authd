const jwt = require("jsonwebtoken");
const config = require("../config/config");
const apiResponse = require("../utils/response");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json(apiResponse("Authorization header missing", null, false));
  }

  const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res
      .status(401)
      .json(apiResponse("Bearer token missing", null, false));
  }

  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json(apiResponse("Invalid token", null, false));
    }

    req.userId = decoded.userId; // Attach user ID to the request for future use
    next(); // Continue to the next middleware or route handler
  });
};

module.exports = { authenticate };
