const express = require("express");
const methodOverride = require("method-override");
const connectDB = require("./config/database.js");
const path = require("path");
const ejsMate = require("ejs-mate");
const { errorHandler, notFound } = require("./middleware/errorHandler.js");
const listingRoute = require("./routes/listingRoute.js");
const reviewRoute = require("./routes/reviewRoute.js");
const { logger, errorLogger } = require("./middleware/logger");

const app = express();
const port = 8080;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

app.use(logger);

app.use(express.static("public"));
app.use(methodOverride("_method"));

//middleware to parse(read) data
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
  const healthData = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
  };

  // Render the 'health.ejs' template and pass the data to it
  res.render("listings/health", healthData);
});

// 404 handler
app.use(notFound);

// ERROR LOG
app.use(errorLogger);

// Error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
