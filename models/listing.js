const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Review = require("../models/review.js");

const listingSchema = new schema({
  title: {
    type: String,
    required: true,
    maxLength: 50,
    index: true, // Index for search functionality
  },
  desc: {
    type: String,
    required: true,
    maxLength: 500,
  },
  image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
      required: true,
    },
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    index: true, // Index for price filtering
  },
  location: {
    type: String,
    required: true,
    maxLength: 100,
    index: true, // Index for location search
  },
  country: {
    type: String,
    required: true,
    maxLength: 50,
    index: true, // Index for country filtering
  },
  review: [
    {
      type: schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true, // Index for sorting by creation date
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

listingSchema.post(/^findOneAnd/, async (doc) => {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.review,
      },
    });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
