import mongoose from "mongoose";

export const Tokens = {
  resetPassword: "reset_password",
  verifyEmail: "verify_email",
  refreshToken: "refresh_token",
};

const tokenSchema = new mongoose.Schema(
  {
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
    },
    expiresAt: {
      type: Date,
      required: true,
      default: Date.now,
      expires: 60,
    },
  },
  { timestamps: true }
);

export default mongoose.model("tokens", tokenSchema);
