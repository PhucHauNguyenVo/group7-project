// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

/**
 * 🧩 Middleware: Bảo vệ route yêu cầu đăng nhập
 * - Kiểm tra token JWT hợp lệ.
 * - Lấy thông tin user từ DB (ẩn password).
 * - Gắn thông tin user vào req.user để controller có thể dùng.
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ Lấy token từ header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2️⃣ Nếu không có token → từ chối truy cập
    if (!token) {
      return res.status(401).json({ message: 'Không có token, từ chối truy cập!' });
    }

    // 3️⃣ Giải mã token bằng secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'my_secret_key');

    // 4️⃣ Tìm user tương ứng trong MongoDB
    req.user = await User.findById(decoded.id).select('-password');

    // Nếu user không tồn tại
    if (!req.user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại trong hệ thống!' });
    }

    // 5️⃣ Nếu DB bị thiếu role → lấy role từ token (dự phòng)
    if (decoded.role && (!req.user.role || req.user.role !== decoded.role)) {
      req.user.role = decoded.role;
    }

    // 🔍 Debug log (chỉ nên dùng khi dev)
    console.log('🧠 Token decoded:', decoded);
    console.log('👤 Authenticated user:', req.user?.email, '| Role:', req.user?.role);

    // 6️⃣ Cho phép đi tiếp tới controller
    next();
  } catch (error) {
    console.error('❌ Lỗi xác thực token:', error.message);
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
  }
};
