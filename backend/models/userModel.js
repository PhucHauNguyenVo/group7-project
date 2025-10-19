const mongoose = require('mongoose');

const USER_ROLES = ['student', 'teacher', 'admin'];

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, default: 'student' },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = {
  User: mongoose.model('User', userSchema),
  USER_ROLES,
};
