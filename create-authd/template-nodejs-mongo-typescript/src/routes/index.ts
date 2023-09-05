import { Router } from "express";

import Auth from "./auth.route";

import response from "../utils/response";

const router = Router();

/**
 * Routes
 */
router.get("/", (_, res) => res.status(200).send(response("ping", "lift off")));

router.use("/api/auth", Auth);

export default router;
