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
    if (!name || !role) return res.status(400).json({ message: 'name & role required' });

    const newUser = new User({ name, role, email });
    await newUser.save();

    // trả về danh sách mới (hoặc bạn có thể trả newUser)
    const users = await User.find().sort({ createdAt: -1 });
    res.status(201).json(users);
  } catch (err) {
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
    res.status(500).json({ message: err.message });
  }
};
