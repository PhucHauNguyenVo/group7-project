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

// 🟢 Lấy danh sách tất cả user (admin + moderator)
// Moderator có thể xem danh sách nhưng không có quyền xóa/cập nhật role (role change dành cho admin)
router.get('/', protect, authorizeRoles('admin', 'moderator'), userController.getUsers);

// 🟢 Tạo user mới (chỉ admin)
router.post('/', protect, authorizeRoles('admin'), userController.createUser);

// 🟡 Cập nhật thông tin user (admin hoặc chính chủ)
router.put('/:id', protect, userController.updateUser);

// 🔴 Xóa user (admin hoặc chính chủ)
router.delete('/:id', protect, userController.deleteUser);

// 🔧 Admin cập nhật role cho user (ví dụ: set moderator)
router.patch('/:id/role', protect, authorizeRoles('admin'), userController.setUserRole);
const upload = require('../middleware/uploadMiddleware');

// 🔹 Upload avatar (người dùng đã đăng nhập)
router.post(
  '/upload-avatar',
  protect,
  upload.single('avatar'),
  userController.uploadAvatar
);

module.exports = router;
