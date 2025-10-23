const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware kiểm tra token đăng nhập
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Token có thể được gửi qua header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Không có token, từ chối truy cập!' });
    }

    // ✅ Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Lấy user từ DB
    req.user = await User.findById(decoded.id).select('-password');

    // 🔧 Nếu DB không có role hoặc bị sai → dùng role trong token
    if (decoded.role && (!req.user.role || req.user.role !== decoded.role)) {
      req.user.role = decoded.role;
    }

    // 🔍 Debug để bạn xem
    console.log("🧠 Token decoded:", decoded);
    console.log("👤 User sau khi xác thực:", req.user?.email, req.user?.role);

    if (!req.user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại!' });
    }

    next();
  } catch (error) {
    console.error('❌ Lỗi xác thực:', error);
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
  }
};
