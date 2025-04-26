const joi = require("joi");

const registrationSchema = joi.object().keys({
  name: joi.string().required(),
  email: joi.string().required(),
  password: joi.string().required(),
  phone_no: joi.string().required(),
  role: joi.number().required(),
  profile_image: joi.string().optional(),
});

const loginSchema = joi.object().keys({
  email: joi.string().required(),
  password: joi.string().required(),
});

const productSchema = joi.object().keys({
  category_id: joi.string().required(),
  name: joi.string().required(),
  description: joi.string().optional(),
  image_url: joi.string().optional(),
  price: joi.number().required(),
});

const productUpdateSchema = joi.object().keys({
  name: joi.string().required(),
  description: joi.string().required(),
  image_url: joi.string().required(),
  price: joi.number().required(),
});

const productFavoriteSchema = joi.object().keys({
  is_favorite: joi.boolean().required(),
});

const productReviewSchema = joi.object().keys({
  rating: joi.number().required(),
  review: joi.string().optional(),
});

module.exports = {
  registrationSchema,
  loginSchema,
  productSchema,
  productUpdateSchema,
  productFavoriteSchema,
  productReviewSchema
};
