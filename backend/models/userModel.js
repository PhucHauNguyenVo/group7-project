const mongoose = require('mongoose');

const USER_ROLES = ['user', 'admin', 'student'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên người dùng!'],
      trim: true,
    },
    username: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email!'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ!'],
    },
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu!'],
      minlength: [6, 'Mật khẩu tối thiểu 6 ký tự!'],
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
module.exports.USER_ROLES = USER_ROLES;
