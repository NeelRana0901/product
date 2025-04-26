const path = require("path");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Connection Function
exports.connection = async () => {
  try {
    await mongoose.connect(process.env.URL);
    console.log("DB connected successfully!");
  } catch (err) {
    console.log("Error at connecting an MongoDB Server", err);
  }
};

// Exports
exports.db = {
  mongoose: mongoose,
  url: process.env.URL,
  users: require("../models/userModel")(mongoose),
  products: require("../models/productModel")(mongoose),
  productReviews: require("../models/productReviewModel")(mongoose),
  favoriteProducts: require("../models/favoriteProductModel")(mongoose),
  productCategories: require("../models/productCategoryModel")(mongoose),
  loginLogs: require("../models/loginLogModel")(mongoose),
  tokens: require("../models/tokenModel")(mongoose),
  apiErrorLogs: require("../models/apiErrorLogModel")(mongoose),
};