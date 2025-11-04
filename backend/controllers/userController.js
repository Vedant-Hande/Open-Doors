const User = require("../models/user.js");
const passport = require("passport");

module.exports.loginUserRoute = (req, res) => {
  res.render("user/login.ejs");
};

module.exports.signupUserRoute = (req, res) => {
  res.render("user/signup.ejs");
};

module.exports.signupFormRoute = async (req, res) => {
  try {
    const { password, ...userData } = req.body;
    const user = new User(userData);

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
};

module.exports.loginFormRoute = [
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/user/login",
  }),
  async (req, res) => {
    req.flash("success", `Welcome back, ${req.user.firstName}!`);
    const redirectUrl = res.locals.redirectUrl ? res.locals.redirectUrl : "/";
    res.redirect(redirectUrl);
  },
];

module.exports.LogoutUserRoute = (req, res) => {
  req.logout((err) => {
    if (err) {
      req.flash("error", "Logout failed. Please try again.");
      return res.render("logout");
    }
    req.flash("success", "You have been logged out successfully.");
    res.redirect("/");
  });
};

module.exports.LogoutFormRoute = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You have been logged out successfully.");
    return res.render("logout");
  });
};
