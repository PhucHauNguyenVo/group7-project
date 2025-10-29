const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// ===========================================================
// 🟢 ĐĂNG KÝ
// ===========================================================
exports.signup = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc.' });
    }

    const displayName = (name || username || '').trim();
    if (!displayName) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tên hiển thị.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const safeRole = User.USER_ROLES?.includes(role) ? role : undefined;

    const user = await User.create({
      name: displayName,
      username: username || undefined,
      email,
      password: hashedPassword,
      ...(safeRole ? { role: safeRole } : {}),
    });

    res.status(201).json({
      message: 'Đăng ký thành công',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('❌ Lỗi đăng ký:', err);
    res.status(500).json({ message: 'Lỗi server khi đăng ký.' });
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
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Sai mật khẩu' });

    const tokenPayload = { id: user._id, role: user.role };
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'my_secret_key',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('❌ Lỗi đăng nhập:', err);
    res.status(500).json({ message: err.message });
  }
};

// ===========================================================
// 🔐 QUÊN MẬT KHẨU
// ===========================================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });

    // 🔹 Tạo token reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHashed = crypto.createHash('sha256').update(resetToken).digest('hex');

    // 🔹 Lưu token hash và thời hạn
    user.resetPasswordToken = resetTokenHashed;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 phút
    await user.save();

    // 🔹 Link reset (frontend)
  const clientBase = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${clientBase.replace(/\/?$/, '')}/reset-password/${resetToken}`;

    // 🔹 Cấu hình gửi mail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
  from: `"Nhóm 7 - Hệ thống" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔐 Đặt lại mật khẩu của bạn',
      html: `
        <h3>Xin chào ${user.username || 'bạn'},</h3>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản tại hệ thống Nhóm 7.</p>
        <p>Nhấn vào liên kết bên dưới để đặt lại mật khẩu (có hiệu lực trong 15 phút):</p>
        <a href="${resetUrl}" style="padding:10px 15px;background:#007bff;color:#fff;border-radius:5px;text-decoration:none;">Đặt lại mật khẩu</a>
        <br><br>
        <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
        <p>Trân trọng,<br>Nhóm 7</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: '✅ Đã gửi email đặt lại mật khẩu!',
    });
  } catch (err) {
    console.error('❌ Lỗi gửi email đặt lại mật khẩu:', err);
    res.status(500).json({ message: 'Lỗi khi gửi email', error: err.message });
  }
};

// ===========================================================
// 🟢 ĐẶT LẠI MẬT KHẨU
// ===========================================================
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token) return res.status(400).json({ message: 'Thiếu token trong URL' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    console.log('🔍 Token từ URL:', token);
    console.log('🔍 Token hash tìm trong DB:', hashedToken);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }, // 🔹 đúng field
    });

    if (!user)
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });

    // 🔹 Cập nhật mật khẩu
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: '✅ Đặt lại mật khẩu thành công!' });
  } catch (err) {
    console.error('❌ Lỗi đặt lại mật khẩu:', err);
    res.status(500).json({ message: err.message });
  }
};

// ===========================================================
// 🟢 ĐĂNG XUẤT
// ===========================================================
exports.logout = async (req, res) => {
  res.status(200).json({ message: 'Đăng xuất thành công' });
};
