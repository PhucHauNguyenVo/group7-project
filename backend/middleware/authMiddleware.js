const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

/**
 * Middleware bảo vệ route — yêu cầu Access Token hợp lệ
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Lấy token từ Header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Không có token
    if (!token) {
      return res.status(401).json({ message: "Không có token, từ chối truy cập!" });
    }

    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lấy user từ database (ẩn password)
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại!" });
    }

    // Gắn user vào request
    req.user = user;

    // Debug (bật lúc cần)
    // console.log(`✅ Authenticated: ${user.email} | role: ${user.role}`);

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc hết hạn!" });
  }
};

module.exports = { protect };
