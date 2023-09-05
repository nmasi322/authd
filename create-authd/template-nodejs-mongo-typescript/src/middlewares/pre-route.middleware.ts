import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import express from "express";
import cookieParser from "cookie-parser";

import type { Application } from "express";

const CORS_SETTINGS = {
  credentials: true,
  exposedHeaders: ["set-cookie"],
  origin: ["https://your_link_1", "https://your_link_2"],
};

export default (app: Application) => {
  // Set Env File
  dotenv.config();

  // enable CORS
  app.use(cors(CORS_SETTINGS));

  // Parse cookies
  app.use(cookieParser());

  // Secure the app by setting various HTTP headers off.
  app.use(helmet({ contentSecurityPolicy: false }));

  // Logger
  app.use(morgan("common"));

  // Tell express to recognize the incoming Request Object as a JSON Object
  app.use(express.json({ limit: "5mb" }));

  // Express body parser
  app.use(express.urlencoded({ limit: "5mb", extended: true }));

  return app;
};
