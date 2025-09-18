const fs = require("fs");
const path = require("path");

/**
 * Advanced logging middleware for Express.js
 * Logs requests to both console and file
 */
class RequestLogger {
  constructor(options = {}) {
    this.logsDir = options.logsDir || path.join(__dirname, "logs");
    this.logFile = path.join(this.logsDir, "app.log");
    this.errorLogFile = path.join(this.logsDir, "error.log");
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = options.maxFiles || 5;

    this.ensureLogsDirectory();
  }

  ensureLogsDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  /**
   * Format log entry
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {number} responseTime - Response time in ms
   * @returns {string} Formatted log entry
   */
  formatLogEntry(req, res, responseTime) {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get("User-Agent") || "Unknown";
    const statusCode = res.statusCode;
    const contentLength = res.get("Content-Length") || 0;

    return `${timestamp} - ${method} ${url} - ${statusCode} - ${responseTime}ms - ${contentLength}b - ${ip} - ${userAgent}\n`;
  }

  /**
   * Write log to file
   * @param {string} logEntry - Log entry to write
   * @param {string} logFile - Log file path
   */
  writeToFile(logEntry, logFile) {
    fs.appendFile(logFile, logEntry, (err) => {
      if (err) {
        console.error("Error writing to log file:", err);
      }
    });
  }

  /**
   * Rotate log file if it's too large
   * @param {string} logFile - Log file path
   */
  rotateLogFile(logFile) {
    try {
      const stats = fs.statSync(logFile);
      if (stats.size > this.maxFileSize) {
        // Create backup file
        const backupFile = `${logFile}.${Date.now()}`;
        fs.renameSync(logFile, backupFile);

        // Keep only maxFiles number of backup files
        const files = fs
          .readdirSync(this.logsDir)
          .filter((file) => file.startsWith(path.basename(logFile)))
          .sort()
          .reverse();

        if (files.length > this.maxFiles) {
          files.slice(this.maxFiles).forEach((file) => {
            fs.unlinkSync(path.join(this.logsDir, file));
          });
        }
      }
    } catch (err) {
      console.error("Error rotating log file:", err);
    }
  }

  /**
   * Main logging middleware
   * @returns {Function} Express middleware function
   */
  middleware() {
    return (req, res, next) => {
      const startTime = Date.now();

      // Override res.end to capture response time
      const originalEnd = res.end;
      res.end = function (chunk, encoding) {
        const responseTime = Date.now() - startTime;
        const logEntry = this.formatLogEntry(req, res, responseTime);

        // Write to console
        console.log(logEntry.trim());

        // Write to file
        this.writeToFile(logEntry, this.logFile);

        // Rotate log file if needed
        this.rotateLogFile(this.logFile);

        // Call original end method
        originalEnd.call(this, chunk, encoding);
      }.bind(this);

      next();
    };
  }

  /**
   * Error logging middleware
   * @returns {Function} Express error middleware function
   */
  errorMiddleware() {
    return (err, req, res, next) => {
      const timestamp = new Date().toISOString();
      const errorLog = `${timestamp} - ERROR - ${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}\n${err.stack}\n\n`;

      // Write error to console
      console.error(errorLog);

      // Write error to file
      this.writeToFile(errorLog, this.errorLogFile);

      next(err);
    };
  }

  /**
   * Get log statistics
   * @returns {Object} Log statistics
   */
  getStats() {
    try {
      const stats = fs.statSync(this.logFile);
      return {
        logFileSize: stats.size,
        lastModified: stats.mtime,
        logFiles: fs
          .readdirSync(this.logsDir)
          .filter((file) => file.endsWith(".log")),
      };
    } catch (err) {
      return { error: "Could not read log stats" };
    }
  }
}

// Export singleton instance
const logger = new RequestLogger();
module.exports = logger;
