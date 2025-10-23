const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ================== Authentication Routes ==================

// Đăng ký tài khoản mới
router.post('/signup', authController.signup);

// Đăng nhập
router.post('/login', authController.login);

// Đăng xuất
router.post('/logout', authController.logout);

// ✅ Route kiểm tra hoạt động
router.get('/test', (req, res) => {
  res.send('✅ Auth route đang hoạt động bình thường!');
});

// ================== HOẠT ĐỘNG 4: QUÊN MẬT KHẨU / ĐẶT LẠI MẬT KHẨU ==================

// Gửi token reset mật khẩu qua email (hoặc log ra console)
router.post('/forgot-password', authController.forgotPassword);

// Đặt lại mật khẩu mới bằng token
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
