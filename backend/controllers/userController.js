<<<<<<< HEAD
let users = [
  { id: 1, name: "Phúc Hậu", role: "Nhóm trưởng - Backend" },
  { id: 2, name: "Trung Tính", role: "Database" },
  { id: 3, name: "Đại Nguyên", role: "Frontend" }
];

// 📖 GET - Lấy danh sách người dùng
exports.getUsers = (req, res) => {
  res.json(users);
};

// ➕ POST - Thêm người dùng mới
exports.createUser = (req, res) => {
  const { name, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({ message: "Vui lòng nhập đủ thông tin name và role." });
  }

  const newUser = { id: Date.now(), name, role };
  users.push(newUser);

  res.status(201).json({
    message: "Thêm thành viên thành công!",
    user: newUser
  });
};

// ✏️ PUT - Cập nhật thông tin người dùng
exports.updateUser = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID không hợp lệ." });
  }

  const { name, role } = req.body;
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Không tìm thấy người dùng để cập nhật." });
  }

  users[index] = {
    ...users[index],
    name: name || users[index].name,
    role: role || users[index].role
  };

  res.json({
    message: "Cập nhật thành công!",
    user: users[index]
  });
};

// ❌ DELETE - Xóa người dùng theo ID
exports.deleteUser = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID không hợp lệ." });
  }

  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Không tìm thấy người dùng cần xóa." });
  }

  const [deletedUser] = users.splice(index, 1);

  res.json({
    message: "Xóa thành viên thành công!",
    deleted: deletedUser
  });
=======
const User = require('../models/userModel');

// GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { name, role, email } = req.body;

    // ✅ chỉ kiểm tra name (role không bắt buộc nữa)
    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    // Tạo user mới
    const newUser = new User({ name, role, email });
    await newUser.save();

    // ✅ Sau khi thêm, trả về danh sách mới nhất
    const users = await User.find().sort({ createdAt: -1 });
    res.status(201).json(users);
  } catch (err) {
    console.error("❌ Lỗi khi tạo user:", err);
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, email } = req.body;

    const updated = await User.findByIdAndUpdate(id, { name, role, email }, { new: true });
    if (!updated) return res.status(404).json({ message: 'User not found' });

    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật user:", err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });

    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("❌ Lỗi khi xóa user:", err);
    res.status(500).json({ message: err.message });
  }
>>>>>>> frontend
};
