const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshAccessToken);
router.post("/logout", authenticate, authController.logout);

module.exports = router;
