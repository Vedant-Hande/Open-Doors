const Joi = require("joi");
const listingSchema = Joi.object({
  title: Joi.string().required(),
  desc: Joi.string().required(),
  image: Joi.string(),
});
