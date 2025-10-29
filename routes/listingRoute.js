const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {
  validateListing,
  validateReview,
} = require("../middleware/validation.js");
const { isLoggedIn } = require("../middleware/userAuth.js");

// all listings route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({}).populate("owner");
    res.render("listings/index.ejs", { allListings });
  })
);

//new listing route - form to create new listing
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/newListing.ejs");
});

//show route - show details of a specific listing
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate("review")
      .populate("owner");
    // console.log(listing);
    if (!listing) {
      req.flash("error", "Listing you requested for is not exist!");
      return res.redirect("/listing");
    }

    // Handle null owner - this is for listings created before owner field was added
    if (!listing.owner) {
      console.log(
        `Warning: Listing ${id} has no owner assigned. This is a legacy listing.`
      );
    }

    try {
      res.render("listings/show.ejs", { listing });
    } catch (error) {
      console.error("Template rendering error:", error);
      req.flash(
        "error",
        "Sorry, there was an error loading this listing. Please try again."
      );
    }
  })
);

//create new listing route - handle form submission
router.post(
  "/",
  isLoggedIn,
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
      owner: req.user._id,
    });
    console.log(req.body);
    await newListing.save();
    console.log("New listing created:", newListing);
    req.flash("success", "New Property Listed!");
    res.redirect("/listing");
  })
);

//edit listing route - form to edit an existing listing
router.get(
  "/:id/edit",
  isLoggedIn,
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
    req.flash("success", `${title} Property updated!`);
    console.log(updatedListing);
    res.redirect(`/listing/${id}`);
  })
);

//delete listing route
router.delete(
  "/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Property Deleted!");
    console.log("Listing deleted", deletedListing);
    res.redirect("/listing");
  })
);
module.exports = router;
