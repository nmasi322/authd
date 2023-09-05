import express from "express";
import http from "http";
import "./database/mongo.js";

const app = express();
const httpServer = http.createServer(app);

// Pre-route middlewares
import preRouteMiddleware from "./middlewares/pre-route.middleware.js";
preRouteMiddleware(app);

// routes
import routes from "./routes/index.js";
app.use(routes);

// Error middlewares
import errorMiddleware from "./middlewares/error.js";
errorMiddleware(app);

// Listen to server port
import { PORT } from "./config/config.js";

httpServer.listen(PORT, async () => {
  console.log(`📡 Server listening on port @ http://localhost:${PORT}`);
});

// On server error
app.on("error", (error) => {
  console.error(`:( An error occurred on the server: \n ${error}`);
});
