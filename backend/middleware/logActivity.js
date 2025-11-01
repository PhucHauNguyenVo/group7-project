// middleware/logActivity.js
const ActivityLog = require('../models/ActivityLog');

module.exports = async function logActivity(req, res, next) {
  try {
    const userId = req.user ? req.user._id : null;
    const action = req.activityAction || req.originalUrl;
    const ip = req.ip;
    await ActivityLog.create({ userId, action, ip });
  } catch (err) {
    // Không chặn request nếu log lỗi
  }
  next();
};