const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String }, // 👈 Không còn bắt buộc nữa
  email: { type: String } // Tùy chọn
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
