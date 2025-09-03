const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  title: Joi.string().required(),
  desc: Joi.string().required(),
  price: Joi.number().required(),
  location: Joi.string().required(),
  country: Joi.string().required(),
  image: Joi.object().required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required().max(250),
  }).required(),
});
