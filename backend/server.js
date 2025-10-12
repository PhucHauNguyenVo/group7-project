// 📦 Nạp thư viện và cấu hình môi trường
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // 👈 cho phép frontend truy cập
const userRoutes = require('./routes/user');

// 🚀 Khởi tạo app
const app = express();
const PORT = process.env.PORT || 3000;

// ⚙️ Middleware
app.use(cors()); // 👈 bật CORS cho phép frontend (React) gọi API
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔗 Kết nối MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// 🧭 Routes chính
app.use('/api', userRoutes); // 👈 API endpoint sẽ bắt đầu bằng /api, ví dụ: /api/users

// 🖥️ Chạy server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
