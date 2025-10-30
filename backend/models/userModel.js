// models/userModel.js
const mongoose = require('mongoose');

// ====================== 🧩 USER SCHEMA ====================== //
const userSchema = new mongoose.Schema(
  {
    // Họ tên người dùng
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên người dùng!'],
      trim: true,
    },

    // Email duy nhất cho mỗi tài khoản
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email!'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ!'],
    },

    // Mật khẩu đã được mã hóa bằng bcrypt
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu!'],
      minlength: [6, 'Mật khẩu tối thiểu 6 ký tự!'],
    },

    // Phân quyền người dùng
    role: {
      type: String,
      // Thêm 'moderator' cho phân quyền nâng cao (Hoạt động 2)
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },

    // ================== HOẠT ĐỘNG 4: NÂNG CAO ==================
    avatar: {
      type: String,
      default: '',
      comment: 'Đường dẫn ảnh đại diện (Cloudinary URL)',
    },
     // Fields for password reset flow
     resetPasswordToken: { type: String },
     resetPasswordExpire: { type: Date },
  },
  {
    timestamps: true, // ✅ Tự động tạo createdAt & updatedAt
  }
);

// ====================== 🧩 EXPORT MODEL ====================== //
const User = mongoose.model('User', userSchema);
module.exports = User;
