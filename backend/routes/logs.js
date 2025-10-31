// routes/logs.js
const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/userModel');

// Middleware: chỉ cho admin truy cập
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin mới được truy cập nhật ký hoạt động!' });
  }
  next();
}

// GET /api/logs?page=1&limit=20
router.get('/', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Lấy tổng số log
    const total = await ActivityLog.countDocuments();
    // Lấy log, join email user
    const items = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: 'userId', select: 'email name' });

    res.json({ items, total, page, limit });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi lấy nhật ký hoạt động!' });
  }
});

module.exports = router;
