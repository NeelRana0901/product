const express = require("express");
const router = express.Router();
const schema = require("./schema");
const { validateSchema } = require("../utils/helper");
const { authAccessToken } = require("../middleware/auth");
const userController = require("../controllers/userController");

router.post("/user", validateSchema(schema.registrationSchema), userController.registration);
router.get("/user", authAccessToken, userController.getProfileDetails);
router.post("/user/image/:image_type", userController.uploadProfileImage);
router.put("/user/recently-viewed/:product_id", authAccessToken, userController.recentlyViewedProduct);

module.exports = router;
