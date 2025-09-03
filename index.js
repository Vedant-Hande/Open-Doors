const express = require("express");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

const app = express();
const port = 8080;

app.set("views", path.join(__dirname, "views"));
app.set("views engine", "ejs");
app.engine("ejs", ejsMate);

app.use(express.static("public"));
app.use(methodOverride("_method"));

//middleware to parse data
app.use(express.urlencoded({ extended: true }));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/TripSpot");
}

main()
  .then((result) => {
    console.log(`connected to mongoDB`);
  })
  .catch((err) => {
    console.log("error connecting to mongoDB", err);
  });

// default route - redirect to listings
// app.get("/", (req, res) => {
//   res.render("listings/index.ejs");
// });

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

function validateReview(req, res, next) {
  let { error } = reviewSchema.validate(req.body);
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
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

//new listing route - form to create new listing
app.get("/listing/new", (req, res) => {
  res.render("listings/newListing.ejs");
});

//show route - show details of a specific listing
app.get(
  "/listing/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("review");
    res.render("listings/show.ejs", { listing });
  })
);

//create new listing route - handle form submission
app.post(
  "/listings",
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
    console.log("New listing created:", newListing);
    res.redirect("/listings");
  })
);

//edit listing route - form to edit an existing listing
app.get(
  "/listing/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const editListing = await Listing.findById(id);
    res.render("listings/editListing.ejs", { editListing });
  })
);

//update listing route - handle edit form submission
app.put(
  "/listing/:id",
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
app.delete(
  "/listing/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log("Listing deleted", deletedListing);
    res.redirect("/listings");
  })
);

// Review  Post route - show & get review for  specific listing>
app.post(
  "/listing/:id/review",
  validateReview,
  wrapAsync(async (req, res) => {
    let reviewListing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    // adding a review to listing (stores only id)
    reviewListing.review.push(newReview);

    await reviewListing.save();
    await newReview.save();
    res.redirect(`/listing/${reviewListing._id}`);
    console.log(newReview);
  })
);

app.get("/auth/login", (req, res) => {
  res.render("auth/login.ejs");
});

app.get("/signup", (req, res) => {
  res.render("auth/signup.ejs");
});

// page not found Error handling middleware -
app.use((req, res, next) => {
  throw new ExpressError(404, "page not found!");
});

//  final Error handling middleware -
app.use((err, req, res, next) => {
  let { statuscode = 500, message = "something went wrong!" } = err;
  res.status(statuscode).render("error/error.ejs", { message });
  // res.status(statuscode).send(message);
});

app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
