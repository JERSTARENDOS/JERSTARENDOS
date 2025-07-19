const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  otp: String,
  otpExpires: Date,
  resetToken: String,
  resetTokenExpires: Date
});

module.exports = mongoose.model('User', userSchema);
