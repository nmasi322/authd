import express from "express";
import http from "http";
import "./database/mongo";

const app = express();
const httpServer = http.createServer(app);

// Pre-route middlewares
import preRouteMiddleware from "./middlewares/pre-route.middleware";
preRouteMiddleware(app);

// routes
import routes from "./routes";
app.use(routes);

// Error middlewares
import errorMiddleware from "./middlewares/error";
errorMiddleware(app);

// Listen to server port
import { PORT } from "./config";

httpServer.listen(PORT, async () => {
  console.log(`📡 Server listening on port @ http://localhost:${PORT}`);
});

// On server error
app.on("error", (error) => {
  console.error(`:( An error occurred on the server: \n ${error}`);
});
