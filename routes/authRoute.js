const express = require("express");
const router = express.Router();
const schema = require("./schema");
const { validateSchema } = require("../utils/helper");
const { authAccessToken, authRefreshToken } = require("../middleware/auth");
const authController = require("../controllers/authController");

router.post("/login", validateSchema(schema.loginSchema), authController.login);
router.get("/refresh-token", authRefreshToken, authController.refreshToken);
router.get("/logout", authAccessToken, authController.logout);

module.exports = router;
