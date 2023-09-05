import { Router } from "express";
import Auth from "../middlewares/auth.middleware.js";

import authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", authController.register);

router.post("/login", authController.login);

router.get("/me", Auth(false), authController.me);

router.get("/echo", authController.echoUser);

router.post("/email-verification/request", authController.emailVerifyRequest);

router.post("/email-verification", Auth(false), authController.emailVerify);

router.post("/password/reset/request", authController.requestPasswordReset);

router.post("/password/reset", authController.resetPassword);

router.post("/refresh", authController.refreshAuth);

router.put("/password", Auth(), authController.updatePassword);

router.put("/me/update", Auth(), authController.updateMe);

export default router;
