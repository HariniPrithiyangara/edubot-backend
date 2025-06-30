const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  avatar: {
    type: String,
    default: "",
  },
  resetToken: String,
  resetTokenExpire: Date,
});

module.exports = mongoose.model("User", userSchema);
