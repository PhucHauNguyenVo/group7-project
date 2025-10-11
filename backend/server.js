const express = require('express');
const app = express();
const userRoutes = require('./routes/user');
const PORT = 3000;

// ⚡ Bắt buộc phải có dòng này để Express đọc được JSON từ Postman
app.use(express.json());

// ⚡ Nếu dùng Postman mà cần gửi form-data, thêm dòng này cũng được (dự phòng)
app.use(express.urlencoded({ extended: true }));

// Gắn router
app.use('/', userRoutes);

// Chạy server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
