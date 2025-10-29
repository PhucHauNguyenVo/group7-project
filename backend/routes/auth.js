// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ===========================================================
// 🧩 AUTH ROUTES — HOẠT ĐỘNG 1 & 4
// ===========================================================

// 🟢 Đăng ký tài khoản mới (Sign Up)
router.post('/signup', authController.signup);

// 🟢 Đăng nhập (Login)
router.post('/login', authController.login);

// 🟢 Đăng xuất (Logout)
router.post('/logout', authController.logout);

// 🟡 Kiểm tra route hoạt động (Test)
router.get('/test', (req, res) => {
  res.status(200).json({ message: '✅ Auth route đang hoạt động bình thường!' });
});

// ===========================================================
// 🔐 HOẠT ĐỘNG 4: QUÊN MẬT KHẨU / ĐẶT LẠI MẬT KHẨU
// ===========================================================

// Gửi token reset mật khẩu qua email (hiện log ra console)
router.post('/forgot-password', authController.forgotPassword);

// Đặt lại mật khẩu mới bằng token (reset)
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
