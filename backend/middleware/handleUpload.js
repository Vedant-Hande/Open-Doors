const multer = require("multer");
const { storage } = require("../config/cloud.js");

// Configure multer with field filter to only accept 'image' field
const upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
});

const handleUpload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      // Handle multer errors
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return next();
      }
      // For other multer errors, pass them along
      return next(err);
    }
    next();
  });
};

module.exports = handleUpload;
