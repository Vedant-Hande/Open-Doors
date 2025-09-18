# Request Logging - Comprehensive Logging Middleware

## Overview

Request logging tracks all incoming HTTP requests with detailed information including response times, status codes, IP addresses, and user agents. This is essential for monitoring, debugging, and analytics.

## Features

### 📊 What Gets Logged

- **Request Details**: Method, URL, IP address
- **Response Information**: Status code, response time, content length
- **User Information**: User agent, referrer
- **Timestamps**: Precise timing for each request
- **Error Details**: Stack traces and error context

### 📁 Log Files

- **app.log**: General request logs
- **error.log**: Error-specific logs
- **Automatic Rotation**: Prevents log files from growing too large

## How It Works

### 1. Request Interception

```javascript
const logger = (req, res, next) => {
  const startTime = Date.now();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const responseTime = Date.now() - startTime;
    const logEntry = formatLogEntry(req, res, responseTime);

    // Write to console and file
    console.log(logEntry);
    writeToFile(logEntry);

    originalEnd.call(this, chunk, encoding);
  };

  next();
};
```

### 2. Log Format

```
2024-01-15T10:30:45.123Z - GET /api/users - 200 - 45ms - 156b - 192.168.1.100 - Mozilla/5.0...
```

## Benefits

### 🔍 Debugging

- **Track User Behavior**: See what users are doing
- **Identify Issues**: Spot errors and slow requests
- **Performance Analysis**: Monitor response times
- **Security Monitoring**: Detect suspicious activity

### 📈 Analytics

- **Usage Patterns**: Most popular endpoints
- **Peak Times**: When your app is busiest
- **Error Rates**: How often errors occur
- **Performance Trends**: Response time over time

### 🛡️ Security

- **Access Logs**: Who accessed what and when
- **Attack Detection**: Unusual request patterns
- **Audit Trail**: Complete request history
- **Compliance**: Meet logging requirements

## Usage Examples

### Basic Logging

```javascript
const express = require("express");
const logger = require("./logger");

const app = express();

// Add logging middleware
app.use(logger.middleware());

app.get("/api/data", (req, res) => {
  res.json({ message: "Hello World" });
});
```

### Error Logging

```javascript
// Add error logging
app.use(logger.errorMiddleware());

// Error will be logged automatically
app.get("/error", (req, res, next) => {
  next(new Error("Something went wrong"));
});
```

### Custom Log Configuration

```javascript
const logger = new RequestLogger({
  logsDir: "./custom-logs",
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 10,
});
```

## Log Analysis

### Manual Analysis

```bash
# View recent logs
tail -f logs/app.log

# Search for errors
grep "ERROR" logs/app.log

# Find slow requests
grep "ms" logs/app.log | sort -k4 -n

# Count requests by status code
grep "200" logs/app.log | wc -l
```

### Automated Analysis

```javascript
// Get log statistics
app.get("/api/logs/stats", (req, res) => {
  const stats = logger.getStats();
  res.json(stats);
});
```

## Production Considerations

### Log Rotation

```javascript
// Automatic log rotation
rotateLogFile(logFile) {
  if (fileSize > maxFileSize) {
    // Create backup
    fs.renameSync(logFile, `${logFile}.${timestamp}`);

    // Keep only maxFiles number of backups
    cleanupOldLogs();
  }
}
```

### Performance Impact

- **Asynchronous Writing**: Logs don't block requests
- **File Size Limits**: Prevents disk space issues
- **Memory Efficient**: Minimal memory overhead

### Security

```javascript
// Don't log sensitive data
const sanitizeLog = (req) => {
  const sanitized = { ...req };
  delete sanitized.body.password;
  delete sanitized.body.token;
  return sanitized;
};
```

## Advanced Features

### Custom Log Levels

```javascript
const logLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const log = (level, message, req) => {
  if (logLevels[level] <= currentLogLevel) {
    writeLog(level, message, req);
  }
};
```

### Structured Logging

```javascript
const structuredLog = {
  timestamp: new Date().toISOString(),
  level: "INFO",
  message: "Request processed",
  request: {
    method: req.method,
    url: req.url,
    ip: req.ip,
  },
  response: {
    status: res.statusCode,
    time: responseTime,
  },
};
```

### Real-time Monitoring

```javascript
// WebSocket for real-time logs
const io = require("socket.io")(server);

io.on("connection", (socket) => {
  // Send logs to connected clients
  logger.on("log", (logEntry) => {
    socket.emit("log", logEntry);
  });
});
```

## Integration with Monitoring Tools

### ELK Stack (Elasticsearch, Logstash, Kibana)

```javascript
// Send logs to Elasticsearch
const { Client } = require("@elastic/elasticsearch");
const client = new Client({ node: "http://localhost:9200" });

const sendToElasticsearch = async (logEntry) => {
  await client.index({
    index: "app-logs",
    body: logEntry,
  });
};
```

### Prometheus Metrics

```javascript
const prometheus = require("prom-client");

const httpRequestDuration = new prometheus.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
});

// Record metrics
httpRequestDuration
  .labels(req.method, req.route, res.statusCode)
  .observe(responseTime / 1000);
```

## Best Practices

### 1. Log Levels

- **ERROR**: System errors, exceptions
- **WARN**: Potential issues, deprecated usage
- **INFO**: General information, request logs
- **DEBUG**: Detailed debugging information

### 2. Sensitive Data

```javascript
// Never log sensitive information
const sensitiveFields = ["password", "token", "ssn", "creditCard"];
const sanitizeData = (data) => {
  // Remove sensitive fields
  return sanitizedData;
};
```

### 3. Performance

- **Async Logging**: Don't block requests
- **Batch Writing**: Write multiple logs at once
- **Compression**: Compress old log files
- **Cleanup**: Remove old logs regularly

### 4. Monitoring

- **Set Alerts**: Alert on error rates
- **Track Metrics**: Response times, throughput
- **Regular Analysis**: Review logs weekly
- **Capacity Planning**: Monitor log file growth

## Common Use Cases

### E-commerce Application

```javascript
// Track user purchases
app.post("/api/purchase", (req, res) => {
  // Log purchase attempt
  logger.info("Purchase attempt", {
    userId: req.user.id,
    productId: req.body.productId,
    amount: req.body.amount,
  });

  // Process purchase...
});
```

### API Gateway

```javascript
// Log API usage
app.use("/api/*", (req, res, next) => {
  logger.info("API Request", {
    endpoint: req.path,
    method: req.method,
    clientId: req.headers["x-client-id"],
  });
  next();
});
```

### Authentication System

```javascript
// Log login attempts
app.post("/api/login", (req, res) => {
  logger.info("Login attempt", {
    email: req.body.email,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Process login...
});
```

This comprehensive logging system will help you monitor, debug, and optimize your application! 📊
