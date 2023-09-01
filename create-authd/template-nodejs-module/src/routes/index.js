import { Router } from "express";
const router = Router();
import Auth from "./authRoutes";

router.get("/", (_, res) => res.status(200).send(response("ping", "lift off")));
router.use("/api/auth", Auth);

export default router;
