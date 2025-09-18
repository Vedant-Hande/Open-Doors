const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Review = require("./review");

const listingSchema = new schema({
  title: {
    type: String,
    required: true,
    maxLength: 50,
    index: true, // Add index for search functionality
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
    index: true, // Add index for price filtering
  },
  location: {
    type: String,
    required: true,
    maxLength: 100,
    index: true, // Add index for location search
  },
  country: {
    type: String,
    required: true,
    maxLength: 50,
    index: true, // Add index for country filtering
  },
  review: [
    {
      type: schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true, // Add index for sorting
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

listingSchema.post("findByIdAndDelete", async (listing) => {
  if (listing) {
    console.log(listing.review);
    await Review.deleteMany({ _id: { $in: listing.review } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
