const express = require("express");
const router = express.Router({ mergeParams: true });

// Health check endpoint

router.get("", (req, res) => {
  const healthData = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
  };

  // Render the 'health.ejs' template and pass the data to it
  res.render("health/health", healthData);
});

module.exports = router;
