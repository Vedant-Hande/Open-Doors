const express = require("express");
const logger = require("../../middleware/logger");

const app = express();

// Use logging middleware
app.use(logger.middleware());

// Use error logging middleware
app.use(logger.errorMiddleware());

// Sample routes
app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.get("/api/users", (req, res) => {
  const users = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
  ];
  res.json(users);
});

app.get("/api/users/:id", (req, res) => {
  const user = { id: req.params.id, name: "User " + req.params.id };
  res.json(user);
});

app.post("/api/users", (req, res) => {
  res.status(201).json({ message: "User created" });
});

// Error route for testing error logging
app.get("/error", (req, res, next) => {
  next(new Error("This is a test error"));
});

// Log statistics endpoint
app.get("/api/logs/stats", (req, res) => {
  const stats = logger.getStats();
  res.json(stats);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Try these endpoints:");
  console.log("  GET /");
  console.log("  GET /api/users");
  console.log("  GET /api/users/123");
  console.log("  POST /api/users");
  console.log("  GET /error (will log an error)");
  console.log("  GET /api/logs/stats (view log statistics)");
});
