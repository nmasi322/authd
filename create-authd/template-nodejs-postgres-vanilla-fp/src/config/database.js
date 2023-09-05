const { Sequelize } = require("sequelize");
const config = require("./config"); // Import your configuration

// Create a new Sequelize instance
const sequelize = new Sequelize(config.dbConnectionString, {
  dialect: "postgres",
  logging: false, // Disable logging SQL queries (optional)
});

module.exports = sequelize;
