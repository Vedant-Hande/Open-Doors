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
const listingRoute = require("./routes/listingRoute.js");
const reviewRoute = require("./routes/reviewRoute.js");

const app = express();
const port = 8080;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
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

// All listing routes are now handled by the router in routes/listingRoute.js
app.use("/listing", listingRoute);

// Review routes are now handled by the router in routes/reviewRoute.js
app.use("/listing/:id", reviewRoute);

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
