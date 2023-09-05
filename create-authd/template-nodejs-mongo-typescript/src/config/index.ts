import * as dotenv from "dotenv";
dotenv.config();

export const JWT = {
  ACCESS_TOKEN_LIFETIME: "1hr",
  REFRESH_TOKEN_LIFETIME: "30d",
  JWT_SECRET: process.env.JWT_SECRET || "yyyyzzzzzz-999933333-748274bbfb",
  REFRESH_SECRET: process.env.JWT_SECRET || "yyyyzzzzzz-999933333-748274bbfb",
};

export const BCRYPT_SALT = Number(process.env.BCRYPT_SALT) || 10;

export const URL = {
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
};

export const PLUNK_EMAIL = {
  API_URL: process.env.PLUNK_URL || "https://api.useplunk.com/v1/send",
  API_KEY: process.env.PLUNK_API_KEY || "", // ADD YOUR API KEY HERE
};

export const PORT = process.env.PORT || 8080;

export const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/your_db_name";
