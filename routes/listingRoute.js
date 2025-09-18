const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");

function validateListing(req, res, next) {
  let { error } = listingSchema.validate(req.body);
  // console.log(err);
  if (error) {
    let errMsg = error.details.map((ele) => {
      ele.errMsg.join(",");
    });
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
}

// all listings route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

//new listing route - form to create new listing
router.get("/new", (req, res) => {
  res.render("listings/newListing.ejs");
});

//show route - show details of a specific listing
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("review");
    res.render("listings/show.ejs", { listing });
  })
);

//create new listing route - handle form submission
router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res, next) => {
    let { title, desc, price, location, country, image } = req.body;
    const newListing = new Listing({
      title,
      desc,
      price,
      location,
      country,
      "image.url": image.url,
    });
    await newListing.save();

    // Clear cache after creating new listing
    clearCache("/listing");

    console.log("New listing created:", newListing);
    res.redirect("/listing");
  })
);

//edit listing route - form to edit an existing listing
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const editListing = await Listing.findById(id);
    res.render("listings/editListing.ejs", { editListing });
  })
);

//update listing route - handle edit form submission
router.put(
  "/:id",
  validateListing,
  wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let { title, desc, price, location, country, image } = req.body;
    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      {
        title,
        desc,
        price,
        location,
        country,
        "image.url": image.url,
      },
      { runValidators: true, new: true }
    );
    console.log(updatedListing);
    res.redirect(`/listing/${id}`);
  })
);

//delete listing route
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log("Listing deleted", deletedListing);
    res.redirect("/listing");
  })
);

// // Review  Post route - show & get review for  specific listing>
// router.post(
//   "/:id/review",
//   validateReview,
//   wrapAsync(async (req, res) => {
//     let reviewListing = await Listing.findById(req.params.id);
//     const newReview = new Review(req.body.review);
//     // adding a review to listing (stores only id)
//     reviewListing.review.push(newReview);

//     await reviewListing.save();
//     await newReview.save();
//     res.redirect(`/listing/${reviewListing._id}`);
//     console.log(newReview);
//   })
// );

// // Review delete route -
// router.delete(
//   "/:id/review/:reviewId",
//   wrapAsync(async (req, res) => {
//     let { id, reviewId } = req.params;
//     await Listing.findByIdAndUpdate(id, { $pull: { review: reviewId } });
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/listing/${id}`);
//   })
// );

module.exports = router;
