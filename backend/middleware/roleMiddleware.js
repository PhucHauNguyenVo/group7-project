// middleware/roleMiddleware.js

// ✅ Middleware kiểm tra quyền hạn (RBAC)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
      console.log('🧠 [RBAC] Role hiện tại:', req.user?.role, '| Cần:', roles);

      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
          message: 'Bạn không có quyền truy cập chức năng này!',
          currentRole: req.user ? req.user.role : 'none',
          allowedRoles: roles,
        });
      }

      next(); // Cho phép tiếp tục
    } catch (err) {
      console.error('❌ Lỗi trong authorizeRoles:', err);
      res.status(500).json({ message: 'Lỗi server khi kiểm tra quyền!' });
    }
  };
};

module.exports = { authorizeRoles };
