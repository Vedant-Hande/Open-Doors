// middleware/logger.js

const fs = require("fs");
const path = require("path");

// --- Setup ---
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const logFile = path.join(logsDir, "app.log");
const errorLogFile = path.join(logsDir, "error.log");
const accessLogFile = path.join(logsDir, "access.log");

// --- Log Rotation Function ---
const rotateLogFile = (filePath, maxSize = 10 * 1024 * 1024) => {
  // 10MB default
  try {
    const stats = fs.statSync(filePath);
    if (stats.size > maxSize) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFile = `${filePath}.${timestamp}`;
      fs.renameSync(filePath, backupFile);
      // Keep only last 5 backup files
      const files = fs
        .readdirSync(logsDir)
        .filter((file) => file.startsWith(path.basename(filePath) + "."))
        .sort()
        .reverse();

      if (files.length > 5) {
        files.slice(5).forEach((file) => {
          fs.unlinkSync(path.join(logsDir, file));
        });
      }
    }
  } catch (err) {
    // console.error("Error rotating log file:", err);
  }
};

// --- Enhanced Request Logger ---
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const userAgent = req.get("User-Agent") || "Unknown";
  const referer = req.get("Referer") || "Direct";

  // Enhanced log entry with more details
  const logEntry = `${timestamp} - ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent} - Referer: ${referer}\n`;

  // Write to app.log
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      // console.error("Error writing to app.log:", err);
    }
  });

  // Write to access.log (separate file for access logs)
  fs.appendFile(accessLogFile, logEntry, (err) => {
    if (err) {
      // console.error("Error writing to access.log:", err);
    }
  });

  // Check for log rotation
  rotateLogFile(logFile);
  rotateLogFile(accessLogFile);

  next();
};

// --- Enhanced Error Logger ---
const errorLogger = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const userAgent = req.get("User-Agent") || "Unknown";
  const referer = req.get("Referer") || "Direct";

  // Enhanced error log entry
  const errorLogEntry = `\n--- ERROR ---
Timestamp: ${timestamp}
Route: ${method} ${url}
IP: ${ip}
User-Agent: ${userAgent}
Referer: ${referer}
Error Message: ${err.message}
Error Code: ${err.code || "N/A"}
Stack Trace:
${err.stack}
--- END ERROR ---\n`;

  // Write to error.log
  fs.appendFile(errorLogFile, errorLogEntry, (writeErr) => {
    if (writeErr) {
      // console.error("Error writing to error.log:", writeErr);
    }
  });

  // Check for log rotation
  rotateLogFile(errorLogFile);

  // Pass the error to the next error handler
  next(err);
};

// --- Performance Logger ---
const performanceLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const statusCode = res.statusCode;
    const ip =
      req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    const perfLogEntry = `${timestamp} - ${method} ${url} - Status: ${statusCode} - Duration: ${duration}ms - IP: ${ip}\n`;

    // Log slow requests (>1 second) to a separate file
    if (duration > 1000) {
      const slowLogFile = path.join(logsDir, "slow-requests.log");
      fs.appendFile(slowLogFile, perfLogEntry, (err) => {
        if (err) {
          // console.error("Error writing to slow-requests.log:", err);
        }
      });
    }

    // Log to console if request is slow
    if (duration > 1000) {
      // console.warn(
      //   `\x1b[33mSLOW REQUEST\x1b[0m: ${method} ${url} took ${duration}ms`
      // );
    }
  });

  next();
};

// --- Log Cleanup Utility ---
const cleanupOldLogs = (daysToKeep = 30) => {
  try {
    const files = fs.readdirSync(logsDir);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    files.forEach((file) => {
      if (file.includes(".")) {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          // console.log(`Cleaned up old log file: ${file}`);
        }
      }
    });
  } catch (err) {
    // console.error("Error cleaning up old logs:", err);
  }
};

module.exports = {
  logger,
  errorLogger,
  performanceLogger,
  cleanupOldLogs,
};
