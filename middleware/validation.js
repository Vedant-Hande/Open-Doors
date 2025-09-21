const Joi = require("joi");
const ExpressError = require("../utils/ExpressError.js");

// Enhanced validation schemas
const listingSchema = Joi.object({
  title: Joi.string().min(3).max(50).trim().required().messages({
    "string.min": "Title must be at least 3 characters long",
    "string.max": "Title cannot exceed 50 characters",
    "any.required": "Title is required",
  }),
  desc: Joi.string().min(10).max(500).trim().required().messages({
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description cannot exceed 500 characters",
    "any.required": "Description is required",
  }),
  price: Joi.number().min(0).max(1000000).required().messages({
    "number.min": "Price must be a positive number",
    "number.max": "Price cannot exceed ₹10,00,000",
    "any.required": "Price is required",
  }),
  location: Joi.string().min(2).max(100).trim().required().messages({
    "string.min": "Location must be at least 2 characters long",
    "string.max": "Location cannot exceed 100 characters",
    "any.required": "Location is required",
  }),
  country: Joi.string().min(2).max(50).trim().required().messages({
    "string.min": "Country must be at least 2 characters long",
    "string.max": "Country cannot exceed 50 characters",
    "any.required": "Country is required",
  }),
  image: Joi.object({
    url: Joi.string().uri().required().messages({
      "string.uri": "Please provide a valid image URL",
      "any.required": "Image URL is required",
    }),
  }).required(),
});

const reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).integer().required().messages({
    "number.min": "Rating must be at least 1",
    "number.max": "Rating cannot exceed 5",
    "any.required": "Rating is required",
  }),
  comment: Joi.string().min(5).max(250).trim().required().messages({
    "string.min": "Comment must be at least 5 characters long",
    "string.max": "Comment cannot exceed 250 characters",
    "any.required": "Comment is required",
  }),
});

// Validation middleware
const validateListing = (req, res, next) => {
  const { error, value } = listingSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    throw new ExpressError(400, errorMessages.join(", "));
  }

  req.body = value; // Use sanitized data
  next();
};

const validateReview = (req, res, next) => {
  const { error, value } = reviewSchema.validate(req.body.review, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    throw new ExpressError(400, errorMessages.join(", "));
  }

  req.body.review = value; // Use sanitized data
  next();
};

module.exports = {
  validateListing,
  validateReview,
  listingSchema,
  reviewSchema,
};
