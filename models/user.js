const mongoose = require("mongoose");
const schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

userSchema.plugin(passportLocalMongoose, {
  usernameField: "username", // default; you can change to "email" if you want email login
  errorMessages: {
    UserExistsError: "Username already taken.",
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
