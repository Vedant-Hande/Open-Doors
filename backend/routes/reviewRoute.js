const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const reviewController = require("../controllers/reviewController.js");
const {
  validateListing,
  validateReview,
} = require("../middleware/validation.js");
const { isLoggedIn } = require("../middleware/userAuth.js");

// Review  Post route - show & get review for specific listing
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.showReviewRoute)
);

// Review delete route -
router.delete(
  "/:reviewId",
  isLoggedIn,
  wrapAsync(reviewController.deleteReviewRoute)
);

module.exports = router;
