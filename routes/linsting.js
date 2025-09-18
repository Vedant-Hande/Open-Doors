const express = require("express");
const router = express.router;
const Listing = require("..listing.js");
const wrapAsync = require("..wrapAsync.js");
const ExpressError = require("..ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

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
