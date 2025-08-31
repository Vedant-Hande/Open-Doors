const Joi = require("joi");
module.exports.listingSchema = Joi.object({
  title: Joi.string().required(),
  desc: Joi.string().required(),
  image: Joi.string().required(),
  price: Joi.number().required(),
  location: Joi.string().required(),
  country: Joi.string().required(),
});
