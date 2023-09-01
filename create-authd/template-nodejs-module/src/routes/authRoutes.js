import { Router } from "express";
const router = Router();
import {
  refreshAccessToken,
  register,
  login,
  logout,
} from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", authenticate, logout);

export default router;
