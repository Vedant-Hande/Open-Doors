const express = require("express");
const router = express.Router({ mergeParams: true });

router.get("/", (req, res) => {
  res.render("staticPage/main.ejs");
});

router.get("/about", (req, res) => {
  res.render("staticPage/about.ejs");
});

router.get("/contact", (req, res) => {
  res.render("staticPage/contact.ejs");
});

router.get("/privacy", (req, res) => {
  res.render("staticPage/privacy.ejs");
});

router.get("/terms", (req, res) => {
  res.render("staticPage/terms.ejs");
});

module.exports = router;
