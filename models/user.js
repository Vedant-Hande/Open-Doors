const { required, string } = require("joi");
const mongoose = require("mongoose");
const schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new schema({
  fName: {
    type: String,
    required: true,
  },
  lName: {
    type: String,
    required: true,
  },
  phoneNum: {
    type: Number,
    required: true,
  },
  password: {
    type: Password,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

userSchema.plugin(passportLocalMongoose, {
  usernameField: "username", // default; I can change to "email" if you want email login
  errorMessages: {
    UserExistsError: "Username already taken.",
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
