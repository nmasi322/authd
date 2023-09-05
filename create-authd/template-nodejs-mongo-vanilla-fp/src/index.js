const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const AuthRoutes = require("./routes/authRoutes");
const config = require("./config/config");
const dotenv = require("dotenv");

const app = express();
const PORT = process.env.PORT || 3000;
dotenv.config();

mongoose
  .connect(config.dbConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("Error connecting to the database", err));

app.use(bodyParser.json());

app.use("/api/auth", AuthRoutes);
app.use("/", (_, res) =>
  res.status(200).send({
    message: "Ping",
    data: "lift off",
    success: true,
  })
);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "An error occurred", error: err.message });
});
