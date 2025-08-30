const express = require("express");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const Listing = require("./models/listing.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

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
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
  })
);

//create new listing route - handle form submission
app.post(
  "/listings",
  wrapAsync(async (req, res, next) => {
    if (!req.body) {
      next(new ExpressError(400, "Send valid data for Listings"));
    }
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
  wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    if (!req.body) {
      next(new ExpressError(400, "Send Valid data to for Listings"));
    }
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

app.get("/auth/login", (req, res) => {
  res.render("auth/login.ejs");
});

app.get("/signup", (req, res) => {
  res.render("auth/signup.ejs");
});

// page not found Error handling middleware -
app.use((req, res, next) => {
  next(new ExpressError(404, "page not found!"));
});

//  final Error handling middleware -
app.use((err, req, res, next) => {
  let { statuscode = 500, message = "something went wrong!" } = err;
  res.status(statuscode).send(message);
});

app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
