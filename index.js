require("dotenv").config();
const express = require("express");
const methodOverride = require("method-override");
const connectDB = require("./config/database.js");

const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const { errorHandler, notFound } = require("./middleware/errorHandler.js");
const listingRoute = require("./routes/listingRoute.js");
const reviewRoute = require("./routes/reviewRoute.js");
const logger = require("./middleware/logger.js");

const app = express();
const port = process.env.PORT;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

app.use(logger);

app.use(express.static("public"));
app.use(methodOverride("_method"));

//middleware to parse data
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" })); // Add JSON parsing with size limit
connectDB();

// All listing routes are now handled by the router in routes/listingRoute.js
app.use("/listing", listingRoute);

// Review routes are now handled by the router in routes/reviewRoute.js
app.use("/listing/:id", reviewRoute);

app.get("/login", (req, res) => {
  res.render("auth/login.ejs");
});

app.get("/signup", (req, res) => {
  res.render("auth/signup.ejs");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
