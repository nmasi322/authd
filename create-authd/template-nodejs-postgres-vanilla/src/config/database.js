import { Sequelize } from "sequelize";
import { POSTGRES_URI } from "./config.js";

// Create a new Sequelize instance
const sequelize = new Sequelize(POSTGRES_URI, {
  dialect: "postgres",
  logging: false, // Disable logging SQL queries (optional)
});

export default sequelize;
