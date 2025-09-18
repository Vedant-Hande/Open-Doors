// middleware/logger.js

const fs = require("fs");
const path = require("path");

// --- Setup ---
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logFile = path.join(logsDir, "app.log");
const errorLogFile = path.join(logsDir, "error.log"); // Path for the new error log

// --- 1. Request Logger (Your existing middleware) ---
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl; // Use originalUrl for the full path
  const ip = req.ip || req.connection.remoteAddress;

  const logEntry = `${timestamp} - ${method} ${url} - IP: ${ip}\n`;

  // Write to app.log
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) console.error("Error writing to app.log:", err);
  });

  // Log to console
  console.log(`${timestamp} - ${method} ${url} - IP: ${ip}`);
  next();
};

// --- 2. Error Logger (New middleware for errors) ---
const errorLogger = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;

  // Format the error log entry, including the error stack
  const errorLogEntry = `\n--- ERROR ---\nTimestamp: ${timestamp}\nRoute: ${method} ${url}\nIP: ${ip}\nError Message: ${err.message}\nStack Trace:\n${err.stack}\n--- END ERROR ---\n`;

  // Write to error.log
  fs.appendFile(errorLogFile, errorLogEntry, (writeErr) => {
    if (writeErr) console.error("Error writing to error.log:", writeErr);
  });

  // Also log the error to the console
  console.error(err);

  // Pass the error to the next error handler (e.g., your main errorHandler)
  next(err);
};

module.exports = {
  logger,
  errorLogger,
};
