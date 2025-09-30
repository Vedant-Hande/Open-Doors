const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {
  validateListing,
  validateReview,
} = require("../middleware/validation.js");
const { isLoggedIn } = require("../middleware/userAuth.js");

// Review  Post route - show & get review for  specific listing>
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(async (req, res) => {
    let reviewListing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    // adding a review to listing (stores only id)
    reviewListing.review.push(newReview);

    await reviewListing.save();
    await newReview.save();
    console.log(newReview);
    req.flash("success", " New Review Added!");

    res.redirect(`/listing/${reviewListing._id}`);
  })
);

// Review delete route -
router.delete(
  "/:reviewId",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { review: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");

    res.redirect(`/listing/${id}`);
  })
);

module.exports = router;
