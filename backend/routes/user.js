const express = require('express');
 backend-auth
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

const User = require('../User');

const router = express.Router();
const rolePath = User?.schema?.path('role');
const ALLOWED_ROLES =
  Array.isArray(rolePath?.enumValues) && rolePath.enumValues.length
    ? rolePath.enumValues
    : ['user', 'admin', 'student'];
const resolveName = ({ name, fullName }) => (name || fullName || '').trim();

// GET /users
router.get('/', async (_req, res) => {
  try {
    const users = await User.find().select('-password -__v').sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

// POST /users
router.post('/', async (req, res) => {
  const { email, password } = req.body;
  const role = req.body.role || 'user';
  const resolvedName = resolveName(req.body);

  if (!resolvedName || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required.' });
  if (!ALLOWED_ROLES.includes(role)) return res.status(400).json({ message: `Role must be one of: ${ALLOWED_ROLES.join(', ')}` });

  try {
    const user = await User.create({ name: resolvedName, email, password, role });
    const { password: _, ...safeUser } = user.toObject({ versionKey: false });
    res.status(201).json(safeUser);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Email already exists.' });
    res.status(500).json({ message: 'Failed to create user.' });
  }
});

// PUT /users/:id
router.put('/:id', async (req, res) => {
  const { role } = req.body;
  if (!ALLOWED_ROLES.includes(role)) return res.status(400).json({ message: `Role must be one of: ${ALLOWED_ROLES.join(', ')}` });

  try {
    const updated = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password -__v');
    if (!updated) return res.status(404).json({ message: 'User not found.' });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Failed to update role.' });
  }
});

// PATCH /users/:id/role
router.patch('/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!ALLOWED_ROLES.includes(role)) return res.status(400).json({ message: `Role must be one of: ${ALLOWED_ROLES.join(', ')}` });

  try {
    const updated = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password -__v');
    if (!updated) return res.status(404).json({ message: 'User not found.' });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Failed to update role.' });
  }
});
 main

module.exports = router;
