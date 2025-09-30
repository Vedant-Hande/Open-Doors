module.exports.isLoggedIn = (req, res, next) => {
  console.log(req.path, "..", req.originalUrl);
  if (!req.isAuthenticated()) {
    req.flash("error", "You should logged in to List your place!");
    return res.redirect("/user/login");
  }
  next();
};
