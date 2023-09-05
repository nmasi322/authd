import mongoose from "mongoose";
import { MONGO_URI } from "../config";

mongoose
  .connect(MONGO_URI as string)
  .then(() => {
    console.log(`🚀 Connected to MongoDB database. ${MONGO_URI}`);
  })
  .catch((err) => {
    console.error(":( Couldn't connect to database", err);
  });
