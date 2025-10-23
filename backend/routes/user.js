const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// ===================== HOẠT ĐỘNG 2: THÔNG TIN CÁ NHÂN ===================== //

// Xem thông tin cá nhân
router.get('/profile', protect, userController.getProfile);

// Cập nhật thông tin cá nhân
router.put('/profile', protect, userController.updateProfile);

// ===================== HOẠT ĐỘNG 3: CRUD ADMIN ===================== //

// Chỉ Admin mới xem hoặc thêm người dùng
router.get('/', protect, authorizeRoles('admin'), userController.getUsers);
router.post('/', protect, authorizeRoles('admin'), userController.createUser);

// Người dùng hoặc Admin mới có thể cập nhật và xóa
router.put('/:id', protect, userController.updateUser);
router.delete('/:id', protect, userController.deleteUser);

module.exports = router;
