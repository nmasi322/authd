import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { BCRYPT_SALT } from "../config/config.js";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required for this business"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      unique: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.virtual("isPasswordSet").get(function () {
  return !!this.password;
});

UserSchema.pre("save", async function (next) {
  // hashes pin if pin is modified
  if (!this.isModified("password")) return next();

  const hash = await bcrypt.hash(this.password, BCRYPT_SALT);
  this.password = hash;

  next();
});

export default mongoose.model("user", UserSchema);
