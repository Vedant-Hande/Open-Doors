const express = require("express");
const user = require("../models/user.js");
const router = express.Router({ mergeParams: true });

router.get("/login", (req, res) => {
  res.render("user/login.ejs");
});

router.get("/signup", (req, res) => {
  res.render("user/signup.ejs");
});

router.post("/signup", (req, res) => {
  let;
});

module.exports = router;
