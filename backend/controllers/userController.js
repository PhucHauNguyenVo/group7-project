const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

// ===================== HOẠT ĐỘNG 3: QUẢN LÝ USER (ADMIN) ===================== //

// GET /api/users → chỉ Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      message: 'Lấy danh sách user thành công!',
      users
    });
  } catch (err) {
    console.error('❌ Lỗi getUsers:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách!' });
  }
};

// POST /api/users → chỉ Admin
exports.createUser = async (req, res) => {
  try {
    const { name, role, email, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'name và email là bắt buộc!' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email đã tồn tại!' });
    }

    const hashedPassword = await bcrypt.hash(password || '123456', 10);
    const newUser = await User.create({ name, role, email, password: hashedPassword });

    res.status(201).json({
      message: 'Tạo user thành công!',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('❌ Lỗi createUser:', err);
    res.status(500).json({ message: 'Lỗi server khi tạo user!' });
  }
};

// PUT /api/users/:id → Admin hoặc chính chủ
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, email } = req.body;

    // Kiểm tra quyền
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return res.status(403).json({ message: 'Không có quyền cập nhật user này!' });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { name, role, email },
      { new: true }
    ).select('-password');

    if (!updated) return res.status(404).json({ message: 'User không tồn tại!' });

    res.status(200).json({
      message: 'Cập nhật user thành công!',
      user: updated
    });
  } catch (err) {
    console.error('❌ Lỗi updateUser:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật!' });
  }
};

// DELETE /api/users/:id → Admin hoặc chính chủ
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra quyền
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return res.status(403).json({ message: 'Không có quyền xóa user này!' });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'User không tồn tại!' });

    res.status(200).json({ message: 'Xóa user thành công!' });
  } catch (err) {
    console.error('❌ Lỗi deleteUser:', err);
    res.status(500).json({ message: 'Lỗi server khi xóa user!' });
  }
};

// ===================== HOẠT ĐỘNG 2: THÔNG TIN CÁ NHÂN ===================== //

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng!' });

    res.json({
      message: 'Lấy thông tin cá nhân thành công!',
      user
    });
  } catch (err) {
    console.error('❌ Lỗi getProfile:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin cá nhân!' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng!' });

    if (name) user.name = name;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    res.json({
      message: 'Cập nhật thông tin thành công!',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('❌ Lỗi updateProfile:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin!' });
  }
};
