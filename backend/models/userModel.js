const mongoose = require('mongoose');

const USER_ROLES = ['user', 'admin', 'moderator'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please provide a name'], trim: true },
    username: { type: String, trim: true },
    email: { type: String, required: [true, 'Please provide email'], unique: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
    password: { type: String, required: [true, 'Please provide password'], minlength: [6, 'Password min length is 6'] },
    role: { type: String, enum: USER_ROLES, default: 'user' },
    avatar: { type: String, default: '' },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
module.exports.USER_ROLES = USER_ROLES;
