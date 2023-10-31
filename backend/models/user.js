const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true, // Ensure unique usernames
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure unique emails
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const UserModel = mongoose.model('user', userSchema);

module.exports = UserModel;
