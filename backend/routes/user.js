const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// ===========================================================
// 🧩 HOẠT ĐỘNG 2: THÔNG TIN CÁ NHÂN (PROFILE)
// ===========================================================

// 🔹 Xem thông tin cá nhân (user đã đăng nhập)
router.get('/profile', protect, userController.getProfile);

// 🔹 Cập nhật thông tin cá nhân (user đã đăng nhập)
router.put('/profile', protect, userController.updateProfile);

// ===========================================================
// 🧩 HOẠT ĐỘNG 3: QUẢN LÝ USER (ADMIN)
// ===========================================================

// 🟢 Lấy danh sách tất cả user (chỉ admin)
router.get('/', protect, authorizeRoles('admin'), userController.getUsers);

// 🟢 Tạo user mới (chỉ admin)
router.post('/', protect, authorizeRoles('admin'), userController.createUser);

// 🟡 Cập nhật thông tin user (admin hoặc chính chủ)
router.put('/:id', protect, userController.updateUser);

// 🔴 Xóa user (admin hoặc chính chủ)
router.delete('/:id', protect, userController.deleteUser);
const upload = require('../middleware/uploadMiddleware');

// 🔹 Upload avatar (người dùng đã đăng nhập)
router.post(
  '/upload-avatar',
  protect,
  upload.single('avatar'),
  userController.uploadAvatar
);

module.exports = router;
