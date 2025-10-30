// controllers/userController.js
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sharp = require('sharp');

/* =========================================================
   🧩 HOẠT ĐỘNG 3: QUẢN LÝ USER (ADMIN)
   ========================================================= */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ message: '✅ Lấy danh sách user thành công!', users });
  } catch (err) {
    console.error('❌ Lỗi getUsers:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách!' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, role, email, password } = req.body;
    if (!name || !email)
      return res.status(400).json({ message: 'Tên và email là bắt buộc!' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: 'Email đã tồn tại!' });

    const hashedPassword = await bcrypt.hash(password || '123456', 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    res.status(201).json({
      message: '✅ Tạo user thành công!',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error('❌ Lỗi createUser:', err);
    res.status(500).json({ message: 'Lỗi server khi tạo user!' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, email } = req.body;

    if (req.user.role !== 'admin' && req.user._id.toString() !== id)
      return res.status(403).json({ message: 'Không có quyền cập nhật user này!' });

    const updated = await User.findByIdAndUpdate(
      id,
      { name, role, email },
      { new: true }
    ).select('-password');

    if (!updated)
      return res.status(404).json({ message: 'User không tồn tại!' });

    res.status(200).json({ message: '✅ Cập nhật user thành công!', user: updated });
  } catch (err) {
    console.error('❌ Lỗi updateUser:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật!' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin' && req.user._id.toString() !== id)
      return res.status(403).json({ message: 'Không có quyền xóa user này!' });

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: 'User không tồn tại!' });

    res.status(200).json({ message: '✅ Xóa user thành công!' });
  } catch (err) {
    console.error('❌ Lỗi deleteUser:', err);
    res.status(500).json({ message: 'Lỗi server khi xóa user!' });
  }
};

/* =========================================================
   �️ HOẠT ĐỘNG 2 (MỞ RỘNG): SET ROLE CHO USER (ADMIN)
   - Endpoint: PATCH /api/users/:id/role
   - Chỉ admin được phép thay đổi role của user
   - Hạn chế role chỉ trong danh sách cho phép
   ========================================================= */
exports.setUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ['user', 'admin', 'moderator'];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        message: 'Role không hợp lệ. Các role hợp lệ: ' + allowedRoles.join(', '),
        allowedRoles,
      });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User không tồn tại!' });

    user.role = role;
    await user.save();

    res.status(200).json({
      message: '✅ Cập nhật role thành công!',
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('❌ Lỗi setUserRole:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật role!' });
  }
};

/* =========================================================
   �👤 HOẠT ĐỘNG 2: THÔNG TIN CÁ NHÂN
   ========================================================= */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user)
      return res.status(404).json({ message: 'Không tìm thấy người dùng!' });

    res.status(200).json({ message: '✅ Lấy thông tin cá nhân thành công!', user });
  } catch (err) {
    console.error('❌ Lỗi getProfile:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin cá nhân!' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ message: 'Không tìm thấy người dùng!' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (avatar !== undefined) user.avatar = avatar || "";

    await user.save();

    res.status(200).json({
      message: '✅ Cập nhật thông tin thành công!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('❌ Lỗi updateProfile:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin!' });
  }
};

/* =========================================================
   🧩 HOẠT ĐỘNG 4: UPLOAD AVATAR (Cloudinary)
   ========================================================= */
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'Bạn chưa đăng nhập!' });
    if (!req.file)
      return res.status(400).json({ message: 'Vui lòng chọn ảnh để upload!' });

    console.log("📦 Upload ảnh:", req.file.originalname);
    // Resize image to 256x256 and convert to JPEG for consistency/optimization
    const resizedBuffer = await sharp(req.file.buffer)
      .resize(256, 256, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `group7/avatars/${req.user._id}`,
          public_id: 'avatar',
          overwrite: true,
          resource_type: 'image',
        },
        (error, uploadResult) => error ? reject(error) : resolve(uploadResult)
      );
      stream.end(resizedBuffer);
    });

    req.user.avatar = result.secure_url;
    await req.user.save();

    res.status(200).json({
      message: '✅ Upload avatar thành công!',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: result.secure_url,
      },
    });
  } catch (err) {
    console.error('❌ Upload avatar error:', err);
    res.status(500).json({ message: 'Lỗi server khi upload avatar!' });
  }
};

/* =========================================================
   🔐 QUÊN MẬT KHẨU / RESET MẬT KHẨU
   ========================================================= */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'Email không tồn tại trong hệ thống!' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpire = Date.now() + 15 * 60 * 1000;

    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = resetTokenExpire;
    await user.save();

    // Lấy CLIENT_URL từ .env, loại bỏ gạch chéo dư cuối nếu có
    let clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL;
    if (!clientUrl) {
      throw new Error('CLIENT_URL chưa được cấu hình trong .env');
    }
    clientUrl = clientUrl.replace(/\/$/, '');
    const resetURL = `${clientUrl}/reset-password/${resetToken}`;
    // Log ra console để QA kiểm tra
    console.log('🔗 Reset password URL:', resetURL);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const mailOptions = {
      from: `"Group7 Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Yêu cầu đặt lại mật khẩu',
      html: `
        <p>Xin chào ${user.name},</p>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu. Nhấn vào liên kết bên dưới để tiếp tục:</p>
        <a href="${resetURL}" target="_blank">Đặt lại mật khẩu</a>
        <p>Liên kết này sẽ hết hạn sau 15 phút.</p>
        <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: '✅ Đã gửi liên kết đặt lại mật khẩu qua email!', resetURL });
  } catch (err) {
    console.error('❌ Lỗi forgotPassword:', err);
    res.status(500).json({ message: 'Lỗi server khi gửi email đặt lại mật khẩu!' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: '✅ Đặt lại mật khẩu thành công!' });
  } catch (err) {
    console.error('❌ Lỗi resetPassword:', err);
    res.status(500).json({ message: 'Lỗi server khi đặt lại mật khẩu!' });
  }
};
