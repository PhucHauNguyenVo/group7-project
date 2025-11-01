// models/ActivityLog.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  ip: { type: String },
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);