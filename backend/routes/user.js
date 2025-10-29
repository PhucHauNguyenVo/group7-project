const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ------------------------------
// Profile (authenticated user)
// ------------------------------
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);

// ------------------------------
// Admin & self-service actions
// ------------------------------
router.get('/', protect, authorizeRoles('admin'), userController.getUsers);
router.post('/', protect, authorizeRoles('admin'), userController.createUser);
router.put('/:id', protect, userController.updateUser);
router.patch('/:id', protect, userController.updateUser);
router.delete('/:id', protect, userController.deleteUser);

// ------------------------------
// Avatar upload
// ------------------------------
router.post(
  '/upload-avatar',
  protect,
  upload.single('avatar'),
  userController.uploadAvatar
);

module.exports = router;

