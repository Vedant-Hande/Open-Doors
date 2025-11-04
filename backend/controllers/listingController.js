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

module.exports.editListingRoute = async (req, res) => {
  let { id } = req.params;
  const editListing = await Listing.findById(id);
  if (!editListing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listing");
  }
  res.render("listings/editListing.ejs", { editListing });
};

module.exports.updateListingRoute = async (req, res, next) => {
  try {
    let { id } = req.params;

    // Build update object with listing data
    const updateData = {
      ...req.body.listing,
    };

    if (req.file) {
      updateData.image = {
        filename: req.file.filename,
        url: req.file.path, // Cloudinary URL
      };
    }

    const updatedListing = await Listing.findByIdAndUpdate(id, updateData, {
      runValidators: true,
      new: true,
    });

    if (!updatedListing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listing");
    }

    req.flash("success", `${updatedListing.title} Property updated!`);
    console.log("Listing updated:", updatedListing);
    res.redirect(`/listing/${id}`);
  } catch (error) {
    console.error("Error updating listing:", error);
    req.flash("error", "Failed to update listing. Please try again.");
    res.redirect(`/listing/${req.params.id}/edit`);
  }
};

module.exports.deleteListingRoute = async (req, res) => {
  let { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Property Deleted!");
  console.log("Listing deleted", deletedListing);
  res.redirect("/listing");
};

module.exports.createListingRoute = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      req.flash("error", "Please upload an image");
      return res.redirect("/listing/new");
    }

    // CloudinaryStorage returns the URL in req.file.path
    // If path is not available, check other possible locations
    const imageUrl = req.file.path;

    if (!imageUrl) {
      console.error("No Cloudinary URL found in req.file:", req.file);
      req.flash("error", "Failed to upload image");
      return res.redirect("/listing/new");
    }

    // Create new listing with Cloudinary URL
    const newListing = new Listing({
      ...req.body.listing,
      image: {
        filename: req.file.filename,
        url: imageUrl,
      },
      owner: req.user._id,
    });

    await newListing.save();
    req.flash("success", "New Property Listed!");
    console.log("New listing created:", newListing);
    res.redirect("/listing");
  } catch (error) {
    console.error("Error creating listing:", error);
    req.flash("error", "Failed to create listing. Please try again.");
    res.redirect("/listing/new");
  }
};
