// middleware/roleMiddleware.js

/**
 * ✅ Middleware kiểm tra quyền hạn người dùng (Role-Based Access Control)
 * Dùng cho các route chỉ cho phép 1 hoặc nhiều role truy cập (VD: 'admin', 'user')
 * 
 * Ví dụ:
 * router.get('/users', protect, authorizeRoles('admin'), controller.getUsers);
 */

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
      // Nếu middleware bảo vệ chưa gán user → từ chối truy cập
      if (!req.user) {
        return res.status(401).json({
          message: 'Bạn chưa đăng nhập hoặc token không hợp lệ!',
        });
      }

      // Debug log (chỉ nên bật khi dev)
      console.log(`🔍 [RBAC] User: ${req.user.email} | Role: ${req.user.role} | Cần quyền:`, roles);

      // Kiểm tra role có trong danh sách cho phép hay không
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          message: 'Bạn không có quyền truy cập chức năng này!',
          currentRole: req.user.role,
          allowedRoles: roles,
        });
      }

      // Nếu hợp lệ → cho phép tiếp tục
      next();
    } catch (err) {
      console.error('❌ Lỗi trong authorizeRoles:', err.message);
      res.status(500).json({ message: 'Lỗi server khi kiểm tra quyền!' });
    }
  };
};
