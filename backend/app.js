const path = require("path");

// Load environment variables from .env file in root directory (skip in production where env vars should be set externally)
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
}

const express = require("express");
const methodOverride = require("method-override");
const connectDB = require("./config/database.js");
const ejsMate = require("ejs-mate");
const { errorHandler, notFound } = require("./middleware/errorHandler.js");
const listingRoute = require("./routes/listingRoute.js");
const reviewRoute = require("./routes/reviewRoute.js");
const userRoute = require("./routes/userRoute.js");
const staticPageRoute = require("./routes/staticPagesRoute.js");
const healthRoute = require("./routes/healthRoute.js");
const { logger, errorLogger } = require("./middleware/logger");
const session = require("express-session");
const sessionConfig = require("./config/session.js");
const flash = require("connect-flash");
const connectFlash = require("./middleware/connectFlash.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

// Initialize Express app
const app = express();

// Sessions and flash messages
app.use(session(sessionConfig));
app.use(flash());
app.use(connectFlash);

// Authentication (Passport.js)
app.use(passport.initialize());
app.use(passport.session());

// Middleware to pass user object to all views
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Configure local strategy using User model helpers
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    User.authenticate()
  )
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// View engine setup (EJS with ejs-mate for layouts/partials)
app.set("views", path.join(__dirname, "../frontend/views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

// Request logging
app.use(logger);

// Static assets and method override for HTML forms (PUT/DELETE)
app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use(methodOverride("_method"));

// Avoid logging 404s for the favicon in dev
app.get("/favicon.ico", (req, res) => res.status(204).end());

// Body parsers ( parse --> read )
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));

// Connect to database
connectDB();

// Feature Routes

// Listings CRUD
app.use("/listing", listingRoute);

// Nested reviews under listing
app.use("/listing/:id/review", reviewRoute);

// User auth/profile
app.use("/user", userRoute);

// Static pages (home, about, contact, etc)
app.use("/", staticPageRoute);

// Health check (readiness/liveness)
app.use("/health", healthRoute);

// 404 handler (for unmatched routes)
app.use(notFound);

// Error logging middleware
app.use(errorLogger);

// Final error handler (renders error page)
app.use(errorHandler);

module.exports = app;
