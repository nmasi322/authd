const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const config = require("../config/config");
const apiResponse = require("../utils/response");

const generateTokens = (user) => {
  const accessToken = jwt.sign({ userId: user._id }, config.jwtSecret, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign(
    { userId: user._id },
    config.refreshTokenSecret,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json(apiResponse("User with this email already exists", null, false));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const { accessToken, refreshToken } = generateTokens(newUser);

    res.status(201).json(
      apiResponse("User registered successfully", {
        user: newUser,
        tokens: { accessToken, refreshToken },
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(apiResponse("An error occurred", error.message, false));
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json(apiResponse("Invalid email or password", null, false));
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.status(200).json(
      apiResponse("Login successful", {
        user,
        tokens: { accessToken, refreshToken },
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(apiResponse("An error occurred", error.message, false));
  }
};

const refreshAccessToken = (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res
      .status(400)
      .json(apiResponse("Refresh token missing", null, false));
  }

  jwt.verify(refreshToken, config.refreshTokenSecret, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json(apiResponse("Invalid refresh token", null, false));
    }

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      config.jwtSecret,
      { expiresIn: "1h" }
    );

    res
      .status(200)
      .json(
        apiResponse("Access token refreshed", { accessToken: newAccessToken })
      );
  });
};

const logout = (req, res) => {
  // Handle logout logic, such as token invalidation
  res.status(200).json(apiResponse("Logout successful"));
};

module.exports = { register, login, refreshAccessToken, logout };
