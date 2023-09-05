import mongoose from "mongoose";
import timedelta from "../utils/date";
import bcrypt from "bcrypt";
import crypto from "crypto";

export enum Tokens {
  resetPassword = "reset_password",
  verifyEmail = "verify_email",
  refreshToken = "refresh_token",
}

export interface ITokenDocument extends mongoose.Document {
  user: string;
  token: string;
  type: Tokens;
  expiresAt: Date | number;
}

export interface ITokenModel extends mongoose.Model<ITokenDocument> {
  newToken: (
    type: Tokens,
    user: mongoose.Types.ObjectId,
    expiration?: number | undefined | null
  ) => Promise<{ tokenDoc: ITokenDocument | null; token: string }>;
}

const tokenSchema: mongoose.Schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: Tokens,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 60,
  },
});

tokenSchema.statics.newToken = async function (
  type: Tokens,
  user: mongoose.Types.ObjectId,
  expiration?: number
) {
  await this.findOneAndDelete({ user, type });
  const _token = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(_token, 10);
  const _authToken = await this.create({
    token: hash,
    user,
    type,
    expiresAt: expiration || Date.now() + timedelta({ minutes: 60 }),
  });
  return { tokenDoc: _authToken, token: _token };
};
export default mongoose.model<ITokenDocument, ITokenModel>(
  "tokens",
  tokenSchema
);
