const ExpressError = require("../utils/ExpressError.js");

// 404 handler with a more descriptive message
const notFound = (req, res, next) => {
  const error = new ExpressError(404, `page Not Found - ${req.originalUrl}`);
  next(error);
  //call next when the middleware is not sending responces
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  // Log the original error for debugging
  console.error(err.stack);

  // Set default status code and message
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong on our end";

  // Customize for specific error types
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Handle template rendering errors
  if (err.message && err.message.includes("Cannot read properties of null")) {
    statusCode = 500;
    message = "Sorry, there was an error loading this page. Please try again.";
  }

  // Handle HTTP headers already sent errors
  if (err.code === "ERR_HTTP_HEADERS_SENT") {
    statusCode = 500;
    message =
      "Sorry, there was an error processing your request. Please try again.";
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value entered";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication failed. Please log in again.";
  }

  // Render the error page using a path relative to the 'views' directory
  // all the next() call comes here at last
  res.status(statusCode).render("../views/listings/error.ejs", {
    statusCode,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
};

module.exports = {
  errorHandler,
  notFound,
};
