const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },                // Tên người dùng
  email: { type: String, required: true, unique: true }, // Email duy nhất
  password: { type: String, required: true },            // Mật khẩu đã mã hóa
  role: { type: String, default: 'user' },               // Mặc định là user

  // ====== THÊM CHO HOẠT ĐỘNG 4 ======
  avatar: { type: String, default: '' },                 // Ảnh đại diện (Cloudinary URL)
  resetPasswordToken: { type: String },                  // Token đặt lại mật khẩu
  resetPasswordExpire: { type: Date },                   // Hạn sử dụng token reset
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
