import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import ms from "ms";
import { customAlphabet } from "nanoid";

import MailService, { MailTemplate } from "./mail.service.js";
import User from "../models/user.model.js";
import Token, { Tokens } from "../models/token.model.js";

import CustomError from "../utils/custom-error.js";

import { JWT, BCRYPT_SALT, URL } from "../config/config.js";

import validator from "../utils/validator.js";

class AuthService {
  async register(data) {
    if (!data.name) throw new CustomError("name is required", 400);
    if (!data.email) throw new CustomError("email is required", 400);

    let user = await User.findOne({ email: data.email });
    if (user) throw new CustomError("email already exists", 400);

    user = await new User(data).save();

    MailService.sendTemplate(
      MailTemplate.welcome,
      "Welcome!",
      { name: user.name, email: user.email },
      {}
    );
    await this.requestEmailVerification(user.email);

    // Generate Auth tokens
    const authTokens = await this.generateAuthTokens(user.id);

    return { user, token: authTokens };
  }

  async login(data) {
    if (!data.email) throw new CustomError("email is required", 400);
    if (!data.password) throw new CustomError("password is required", 400);

    // Check if user exist
    const user = await User.findOne({ email: data.email });
    if (!user) throw new CustomError("incorrect email or password", 400);

    // Check if user password is correct
    if (!user.password) throw new CustomError("Password not set", 400);

    const isCorrect = await bcrypt.compare(data.password, user.password);
    if (!isCorrect) throw new CustomError("incorrect email or password", 400);

    const authTokens = await this.generateAuthTokens(user.id);

    const userJSON = user.toJSON();

    delete userJSON.password;

    return { user: { ...userJSON }, token: authTokens };
  }

  async generateAuthTokens(userId) {
    const accessToken = jsonwebtoken.sign({ id: userId }, JWT.JWT_SECRET, {
      expiresIn: "1h",
    });

    const refreshToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(refreshToken, BCRYPT_SALT);

    const refreshTokenjsonwebtoken = jsonwebtoken.sign(
      { userId, refreshToken },
      JWT.REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    await new Token({
      user: userId,
      token: hash,
      type: Tokens.refreshToken,
      expiresAt: Date.now() + ms("30 days"),
    }).save();

    return { accessToken, refreshToken: refreshTokenjsonwebtoken };
  }

  async refreshAccessToken(data) {
    const { refreshToken: refreshTokenjsonwebtoken } = data;

    const decoded = jsonwebtoken.verify(
      refreshTokenjsonwebtoken,
      JWT.REFRESH_SECRET
    );
    const { userId, refreshToken } = decoded;

    const user = await User.findOne({ _id: userId });
    if (!user) throw new CustomError("User does not exist", 400);

    const RTokens = await Token.find({
      user: userId,
      type: Tokens.refreshToken,
    });
    if (RTokens.length === 0)
      throw new CustomError("invalid or expired refresh token", 400);

    let tokenExists = false;

    for (const token of RTokens) {
      const isValid = await bcrypt.compare(refreshToken, token.token);

      if (isValid) {
        tokenExists = true;
        break;
      }
    }

    if (!tokenExists)
      throw new CustomError("invalid or expired refresh token", 400);

    const accessToken = jsonwebtoken.sign({ id: user._id }, JWT.JWT_SECRET, {
      expiresIn: "1h",
    });

    return accessToken;
  }

  async logout(data) {
    const { refreshToken: refreshTokenjsonwebtoken } = data;

    const decoded = jsonwebtoken.verify(
      refreshTokenjsonwebtoken,
      JWT.JWT_SECRET
    );
    const { refreshToken, userId } = decoded;

    const user = await User.findOne({ _id: userId });
    if (!user) throw new CustomError("User does not exist");

    const RTokens = await Token.find({
      user: userId,
      type: Tokens.refreshToken,
    });
    if (RTokens.length === 0)
      throw new CustomError("invalid or expired refresh token");

    let tokenExists = false;

    for (const token of RTokens) {
      const isValid = await bcrypt.compare(refreshToken, token.token);

      if (isValid) {
        tokenExists = true;
        await token.deleteOne();

        break;
      }
    }

    if (!tokenExists)
      throw new CustomError("invalid or expired refresh token", 400);

    return true;
  }

  async verifyEmail(data) {
    const { userId, otp } = data;
    if (!userId) throw new CustomError("User is required", 400);
    if (!otp) throw new CustomError("OTP is required", 400);

    const user = await User.findOne({ _id: userId });
    if (!user) throw new CustomError("User does not exist", 400);
    if (user.isVerified)
      throw new CustomError("email is already verified", 200);

    const VToken = await Token.findOne({
      user: userId,
      type: Tokens.verifyEmail,
    });
    if (!VToken)
      throw new CustomError("invalid or expired email verify otp", 400);

    const isValid = await bcrypt.compare(otp, VToken.token);
    if (!isValid)
      throw new CustomError("invalid or expired email verify otp", 400);

    await User.updateOne(
      { _id: userId },
      { $set: { isVerified: true } },
      { new: true }
    );

    await VToken.deleteOne();

    return true;
  }

  async requestEmailVerification(email) {
    const user = await User.findOne({ email });
    if (!user) throw new CustomError("email does not exist", 400);
    if (user.isVerified)
      throw new CustomError("email is already verified", 200);

    const token = await Token.findOne({
      user: user._id,
      type: Tokens.verifyEmail,
    });
    if (token) await token.deleteOne();

    const nanoidOTP = customAlphabet("012345789", 6);
    const otp = nanoidOTP();

    const hash = await bcrypt.hash(otp, BCRYPT_SALT);
    await new Token({
      token: hash,
      user: user._id,
      type: Tokens.verifyEmail,
      expiresAt: Date.now() + ms("2h"),
    }).save();

    MailService.sendTemplate(
      MailTemplate.emailVerify,
      "Verify your email address",
      { name: user.name, email: user.email },
      { otp }
    );

    return true;
  }

  async requestPasswordReset(email) {
    if (!email) throw new CustomError("email is required", 400);
    if (!validator.isEmail(email))
      throw new CustomError("Invalid email address", 400);

    const user = await User.findOne({ email });
    if (!user) throw new CustomError("email does not exist");

    let token = await Token.findOne({
      user: user._id,
      type: Tokens.resetPassword,
    });
    if (token) await token.deleteOne();

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, BCRYPT_SALT);

    token = await new Token({
      token: hash,
      user: user._id,
      type: Tokens.resetPassword,
      expiresAt: Date.now() + ms("1h"),
    }).save();

    const link = `${URL.CLIENT_URL}/reset-password/confirm?uid=${token._id}&resetToken=${resetToken}`;
    MailService.sendTemplate(
      MailTemplate.passwordResetRequested,
      "Reset your password",
      { name: user.name, email: user.email },
      { link }
    );

    return true;
  }

  async resetPassword(data) {
    if (!data.resetToken) throw new CustomError("Reset token is required", 400);
    if (!data.tokenId) throw new CustomError("Token id is required", 400);
    if (!data.password) throw new CustomError("New password is required", 400);

    const { tokenId, resetToken, password } = data;

    const RToken = await Token.findOne({
      _id: tokenId,
      type: Tokens.resetPassword,
    });
    if (!RToken) throw new CustomError("Reset token does not exist", 400);

    const isValid = await bcrypt.compare(resetToken, RToken.token);
    if (!isValid)
      throw new CustomError("invalid or expired password reset token", 400);

    const hash = await bcrypt.hash(password, BCRYPT_SALT);

    await User.updateOne(
      { _id: RToken.user },
      { $set: { password: hash } },
      { new: true }
    );

    await RToken.deleteOne();

    return true;
  }

  async updatePassword(userId, data) {
    /*
     * User can create password when password is not yet set
     * User can update password when password is already set
     */
    if (!data.newPassword) throw new CustomError("new password is required");

    const user = await User.findOne({ _id: userId });
    if (!user) throw new CustomError("does dose not exist");

    /*
     * If password is already set make checks ->
     * Ensure oldPassword was passed
     * Ensure oldPassword matches current password
     */
    if (user.password) {
      if (!data.oldPassword) throw new CustomError("password is required");
      // Check if user password is correct
      const isCorrect = await bcrypt.compare(data.oldPassword, user.password);
      if (!isCorrect) throw new CustomError("incorrect password");

      // Check if new password is same as old password
      if (data.oldPassword == data.newPassword)
        throw new CustomError("change password to something different");
    }

    const hash = await bcrypt.hash(data.newPassword, BCRYPT_SALT);
    await User.updateOne(
      { _id: userId },
      { $set: { password: hash } },
      { new: true }
    );
    return true;
  }
}

export default new AuthService();
