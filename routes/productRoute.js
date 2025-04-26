const express = require("express");
const router = express.Router();
const schema = require("./schema");
const { validateSchema } = require("../utils/helper");
const { authAccessToken } = require("../middleware/auth");
const productController = require("../controllers/productController");

router.post("/product", authAccessToken, validateSchema(schema.productSchema), productController.createProduct);
router.post("/product/image/:image_type", productController.uploadProductImage);
router.get("/product", authAccessToken, productController.getProduct);
router.put("/product/:product_id", authAccessToken, validateSchema(schema.productUpdateSchema), productController.updateProductDetail);
router.delete("/product/:product_id", authAccessToken, productController.deleteProduct);

router.get("/product/category", authAccessToken, productController.getCategory);

router.post("/product/favorite/:product_id", validateSchema(schema.productFavoriteSchema), authAccessToken, productController.favoriteProduct);
router.get("/product/favorite", authAccessToken, productController.getFavoriteProduct);

router.post("/product/review/:product_id", authAccessToken, validateSchema(schema.productReviewSchema), productController.productReview);
router.get("/product/review", authAccessToken, productController.getProductReview);

router.get("/product/average-rating/:product_id", authAccessToken, productController.getProductAverageRating);

router.get("/product/suggest", authAccessToken, productController.suggestProduct);

router.get("/product/trending", authAccessToken, productController.trendingProduct);

module.exports = router;
