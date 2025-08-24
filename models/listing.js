const mongoose = require("mongoose");
const schema = mongoose.Schema;

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
      default:
        "https://images.unsplash.com/photo-1750688650387-48fbdc7399b3?q=80&w=1106&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
