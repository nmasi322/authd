import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const Tokens = {
  resetPassword: "reset_password",
  verifyEmail: "verify_email",
  refreshToken: "refresh_token",
};

const Token = sequelize.define("Token", {
  id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  user: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    default: Date.now,
    expires: 60,
  },
});

export default Token;
