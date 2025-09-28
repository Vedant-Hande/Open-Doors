const express = require("express");
const User = require("../models/user.js");
const { validateUser } = require("../middleware/validation.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const router = express.Router({ mergeParams: true });

// GET routes
router.get("/login", (req, res) => {
  res.render("user/login.ejs");
});

router.get("/signup", (req, res) => {
  res.render("user/signup.ejs");
});

// POST routes
router.post(
  "/signup",
  validateUser,
  wrapAsync(async (req, res) => {
    // console.log(req.body);
    try {
      const {
        firstName,
        lastName,
        username,
        email,
        phoneNumber,
        password,
        confirmPassword,
        accountType,
      } = req.body;

      // Create new user
      const user = new User({
        firstName,
        lastName,
        username,
        email,
        confirmPassword,
        phoneNumber,
        accountType,
      });

      // Register user with passport-local-mongoose (handles password hashing)
      const registeredUser = await User.register(user, password);

      // Log the user in after successful registration
      req.login(registeredUser, (err) => {
        if (err) {
          req.flash(
            "error",
            "Registration successful but login failed. Please try logging in manually."
          );
          return res.redirect("/user/login");
        }
        req.flash(
          "success",
          `Welcome to TripSpot, ${firstName}! Your account has been created successfully.`
        );
        res.redirect("/");
      });
    } catch (error) {
      if (error.name === "UserExistsError") {
        req.flash(
          "error",
          "Username or email already exists. Please choose different credentials."
        );
      } else if (error.name === "ValidationError") {
        const errorMessages = Object.values(error.errors).map(
          (err) => err.message
        );
        req.flash("error", errorMessages.join(", "));
      } else {
        req.flash("error", "Registration failed. Please try again.");
        console.error("Registration error:", error);
      }
      res.redirect("/user/signup");
    }
  })
);

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/user/login",
  }),
  async (req, res) => {
    req.flash("success", `Welcome back, ${req.user.firstName}!`);
    const redirectUrl = req.session.returnTo || "/";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

// Logout route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      req.flash("error", "Logout failed. Please try again.");
      return res.render("logout");
    }
    req.flash("success", "You have been logged out successfully.");
    res.redirect("/");
  });
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You have been logged out successfully.");
    return res.render("logout");
  });
});

module.exports = router;
