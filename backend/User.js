const mongoose = require('mongoose');

// Định nghĩa cấu trúc dữ liệu người dùng
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,  // Không cho trùng tên
  },
  email: {
    type: String,
    required: true,
    unique: true,  // Không cho trùng email
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Xuất model ra để có thể dùng ở server.js
module.exports = mongoose.model('User', userSchema);
