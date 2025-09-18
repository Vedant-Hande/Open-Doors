const express = require("express");
const { cacheMiddleware, clearCache } = require("./cache");

const app = express();

// Example route with caching
app.get("/api/users", cacheMiddleware(300), (req, res) => {
  // Simulate database query
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com" },
  ];

  // Simulate processing time
  setTimeout(() => {
    res.json({
      success: true,
      data: users,
      timestamp: new Date().toISOString(),
    });
  }, 1000); // 1 second delay
});

// Example route that clears cache
app.post("/api/users", (req, res) => {
  // Create new user logic here...

  // Clear cache after creating new user
  clearCache("/api/users");

  res.json({ success: true, message: "User created and cache cleared" });
});

// Example route with different cache duration
app.get("/api/settings", cacheMiddleware(600), (req, res) => {
  // Settings change less frequently, cache for 10 minutes
  res.json({
    theme: "dark",
    language: "en",
    notifications: true,
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
  console.log("Try: GET /api/users (cached for 5 minutes)");
  console.log("Try: GET /api/settings (cached for 10 minutes)");
});
