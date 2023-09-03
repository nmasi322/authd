const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./config/database");
const AuthRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

sequelize
  .sync() // Sync models with the database
  .then(() => {
    console.log("Connected to the database 🚀");
    app.listen(PORT, () => {
      console.log(`📡 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("Error connecting to the database", err));

app.use(bodyParser.json());

app.use("/api/auth", AuthRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json(apiResponse("An error occurred", err.message, false));
});
