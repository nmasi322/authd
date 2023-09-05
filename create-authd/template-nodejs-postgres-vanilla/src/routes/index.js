import { Router } from "express";

import Auth from "./auth.route.js";

import response from "../utils/response.js";

const router = Router();

/**
 * Routes
 */
router.get("/", (_, res) => res.status(200).send(response("ping", "lift off")));

router.use("/api/auth", Auth);

export default router;
