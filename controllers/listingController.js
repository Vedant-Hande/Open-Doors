const Listing = require("../models/listing.js");

module.exports.allListingRoute = async (req, res) => {
  const allListings = await Listing.find({}).populate("owner");
  res.render("listings/index.ejs", { allListings });
};

module.exports.newListingRoute = (req, res) => {
  res.render("listings/newListing.ejs");
};

module.exports.showListingRoute = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "review",
      populate: {
        path: "owner",
      },
    })
    .populate("owner");
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
};

module.exports.createListingRoute = async (req, res, next) => {
  let { title, desc, price, location, country, image } = req.body;
  const newListing = new Listing({
    ...req.body.listing,
    "image.url": image.url,
    owner: req.user._id,
  });
  // console.log(req.body);
  await newListing.save();
  req.flash("success", "New Property Listed!");
  res.redirect("/listing");
  console.log("New listing created:", newListing);
};

module.exports.editListingRoute = async (req, res) => {
  let { id } = req.params;
  const editListing = await Listing.findById(id);
  res.render("listings/editListing.ejs", { editListing });
};

module.exports.updateListingRoute = async (req, res, next) => {
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
};

module.exports.deleteListingrRoute = async (req, res) => {
  let { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Property Deleted!");
  console.log("Listing deleted", deletedListing);
  res.redirect("/listing");
};
