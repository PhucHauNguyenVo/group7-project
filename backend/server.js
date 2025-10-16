// 📦 Nạp thư viện và cấu hình môi trường
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/user');

// 🚀 Khởi tạo app
const app = express();
const PORT = process.env.PORT || 4000;

// ⚙️ Middleware
app.use(cors({
  origin: "*", // Cho phép tất cả domain truy cập, bao gồm cả ngrok
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔗 Kết nối MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// 🧭 Routes chính
app.use('/api', userRoutes);

// 🖥️ Chạy server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
