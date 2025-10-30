const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listingController.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {
  validateListing,
  validateReview,
} = require("../middleware/validation.js");
const { isLoggedIn } = require("../middleware/userAuth.js");

// all listings route
router.get("/", wrapAsync(listingController.allListingRoute));

//new listing route - form to create new listing
router.get("/new", isLoggedIn, listingController.newListingRoute);

//show route - show details of a specific listing
router.get("/:id", wrapAsync(listingController.showListingRoute));

//create new listing route - handle form submission
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(listingController.createListingRoute)
);

//edit listing route - form to edit an existing listing
router.get(
  "/:id/edit",
  isLoggedIn,
  wrapAsync(listingController.editListingRoute)
);

//update (edit) listing route - handle edit form submission
router.put(
  "/:id",
  validateListing,
  wrapAsync(listingController.updateListingRoute)
);

//delete listing route
router.delete(
  "/:id",
  isLoggedIn,
  wrapAsync(listingController.deleteListingrRoute)
);
module.exports = router;
