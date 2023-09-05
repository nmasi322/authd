const express = require("express");
const router = express.Router();
const Auth = require("./authRoutes");

router.get("/", (_, res) => res.status(200).send(response("ping", "lift off")));
router.use("/api/auth", Auth);

module.export = router;
