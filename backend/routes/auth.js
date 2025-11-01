// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

// 🟢 Đăng ký tài khoản mới (Sign Up)
router.post('/signup', authController.signup);

// 🟢 Đăng nhập (Login)
router.post('/login', authController.login);

// 🟢 Đăng xuất (Logout)
router.post('/logout', authController.logout);

// 🟢 Làm mới Access Token (Refresh Token)
router.post('/refresh', authController.refreshToken);

// 🟡 Kiểm tra route hoạt động
router.get('/test', (req, res) => {
  res.status(200).json({ message: '✅ Auth route đang hoạt động bình thường!' });
});

// ===========================================================
// 📌 Hoạt động 4 — CHƯA LÀM → Tạm khóa
// ===========================================================

router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);

module.exports = router;
