import mongoose from "mongoose";
import { MONGO_URI } from "../config/config.js";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`🚀 Connected to MongoDB database. ${MONGO_URI}`);
  })
  .catch((err) => {
    console.error(":( Couldn't connect to database", err);
  });
