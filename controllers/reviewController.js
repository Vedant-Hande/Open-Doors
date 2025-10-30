const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.showReviewRoute = async (req, res) => {
  let reviewListing = await Listing.findById(req.params.id);
  const newReview = new Review(req.body.review);
  // adding a review to listing (stores only id)
  reviewListing.review.push(newReview);

  await reviewListing.save();
  (newReview.owner = req.user._id), await newReview.save();

  req.flash("success", " New Review Added!");
  res.redirect(`/listing/${reviewListing._id}`);

  console.log(`New Review listed :  ${newReview}`);
};

module.exports.deleteReviewRoute = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { review: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review Deleted!");
  res.redirect(`/listing/${id}`);
};
