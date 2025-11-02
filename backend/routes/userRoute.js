const express = require("express");
const { validateUser } = require("../middleware/validation.js");
const wrapAsync = require("../utils/wrapAsync.js");
const router = express.Router({ mergeParams: true });
const { saveRedirectUrl } = require("../middleware/userAuth.js");
const userController = require("../controllers/userController.js");

// GET login form routes
router.get("/login", userController.loginUserRoute);

// GET signup form routes
router.get("/signup", userController.signupUserRoute);

// handle signup form submission routes
router.post("/signup", validateUser, wrapAsync(userController.signupFormRoute));

// handle login form submission routes
router.post("/login", saveRedirectUrl, userController.loginFormRoute);

// Logout route
router.get("/logout", userController.LogoutUserRoute);

//handle logout
router.post("/logout", userController.loginFormRoute);

module.exports = router;
