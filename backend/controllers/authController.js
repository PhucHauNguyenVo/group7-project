const User = require('../models/userModel');
const RefreshToken = require('../models/RefreshToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ActivityLog = require('../models/ActivityLog');

// ===========================================================
// 🧠 HÀM TẠO TOKEN (Access + Refresh)
// ===========================================================
const generateTokens = async (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_EXPIRES || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_EXPIRES || '7d' }
  );

  // Hash refresh token before saving to DB for safety
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  // Optionally remove previous tokens for this user (single-session)
  await RefreshToken.deleteMany({ userId }); // Xóa token cũ
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshToken.create({ userId, token: refreshTokenHash, expiresAt });

  return { accessToken, refreshToken };
};

// ===========================================================
// 🟢 ĐĂNG KÝ
// ===========================================================
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Hãy nhập đầy đủ thông tin!" });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email đã tồn tại!" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user"
    });

    res.status(201).json({
      message: "Đăng ký thành công!",
      user: { id: newUser._id, email: newUser.email, role: newUser.role }
    });

  } catch (err) {
    console.error("❌ Lỗi signup:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// ===========================================================
// 🟢 ĐĂNG NHẬP
// ===========================================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Sai mật khẩu!" });

    const { accessToken, refreshToken } = await generateTokens(user._id);

    // Ghi log login sau khi xác thực thành công
    await ActivityLog.create({
      userId: user._id,
      action: '/api/auth/login',
      ip: req.headers['x-forwarded-for'] || req.ip,
      details: `Đăng nhập thành công cho ${user.email}`
    });

    res.status(200).json({
      message: "Đăng nhập thành công",
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, role: user.role }
    });

  } catch (err) {
    console.error("❌ Lỗi login:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// ===========================================================
// 🟢 REFRESH TOKEN
// ===========================================================
exports.refreshToken = async (req, res) => {
  try {

    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: "Thiếu refresh token!" });

    // hash incoming token to compare with stored hash
    const incomingHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const stored = await RefreshToken.findOne({ token: incomingHash });
    if (!stored)
      return res.status(403).json({ message: "Token không tồn tại!" });

    if (stored.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ token: incomingHash });
      return res.status(403).json({ message: "Refresh token hết hạn, đăng nhập lại!" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    await RefreshToken.deleteOne({ token: incomingHash });
    const { accessToken, refreshToken: newRefresh } = await generateTokens(decoded.userId);

    res.status(200).json({
      message: "Cấp token mới thành công!",
      accessToken,
      refreshToken: newRefresh
    });

  } catch (err) {
    console.error("❌ Lỗi refresh:", err);
    return res.status(403).json({ message: "Refresh token không hợp lệ!" });
  }
};

// ===========================================================
// 🟢 LOGOUT
// ===========================================================
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const incomingHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await RefreshToken.deleteOne({ token: incomingHash });
    }

  } catch (err) {
    console.error("❌ Lỗi logout:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};
