const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Review = require("./review");

const listingSchema = new schema({
  title: {
    type: String,
    required: true,
    maxLength: 50,
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
  },
  location: {
    type: String,
    required: true,
    maxLength: 100,
  },
  country: {
    type: String,
    required: true,
    maxLength: 50,
  },
  review: [
    {
      type: schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

listingSchema.post("findByIdAndDelete", async (listing) => {
  if (listing) {
    console.log(listing.review);
    await Review.deleteMany({ _id: { $in: listing.review } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
