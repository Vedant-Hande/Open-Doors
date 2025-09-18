const fs = require("fs");
const path = require("path");

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logFile = path.join(logsDir, "app.log");

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get("User-Agent");

  const logEntry = `${timestamp} - ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}\n`;

  // Write to log file asynchronously
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) console.error("Error writing to log file:", err);
  });

  console.log(`${timestamp} - ${method} ${url} - IP: ${ip}`);
  next();
};

module.exports = logger;
