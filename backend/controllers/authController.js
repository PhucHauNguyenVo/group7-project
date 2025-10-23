const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'my_secret_key';

// ================== Đăng ký (Sign Up) ==================
exports.signup = async (req, res) => {
  try {
    console.log('🛠️ authController.signup - mongoose.readyState =', mongoose.connection.readyState);
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected. Please try again later.' });
    }

    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin!' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email đã tồn tại!' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    res.status(201).json({
      message: 'Đăng ký thành công!',
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (err) {
    console.error('❌ Signup Error:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ================== Đăng nhập (Login) ==================
exports.login = async (req, res) => {
  try {
    console.log('🛠️ authController.login - mongoose.readyState =', mongoose.connection.readyState);
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Thiếu email hoặc mật khẩu!' });

    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng!' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(401).json({ message: 'Sai mật khẩu!' });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Đăng nhập thành công!', token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ================== Quên mật khẩu (Forgot Password) ==================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'Email không tồn tại trong hệ thống!' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 phút
    await user.save();

    const resetUrl = `http://localhost:4000/api/auth/reset-password/${resetToken}`;
    console.log('📩 Link reset mật khẩu:', resetUrl);

    res.json({ message: 'Token reset đã được tạo!', resetUrl });
  } catch (err) {
    console.error('❌ forgotPassword error:', err);
    res.status(500).json({ message: 'Lỗi server khi xử lý forgot-password!' });
  }
};

// ================== Đặt lại mật khẩu (Reset Password) ==================
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Đặt lại mật khẩu thành công!' });
  } catch (err) {
    console.error('❌ resetPassword error:', err);
    res.status(500).json({ message: 'Lỗi server khi reset mật khẩu!' });
  }
};

// ================== Đăng xuất (Logout) ==================
exports.logout = async (req, res) => {
  res.json({ message: 'Đăng xuất thành công! (client tự xóa token)' });
};
