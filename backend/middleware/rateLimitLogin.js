// middleware/rateLimitLogin.js
const rateLimit = {};

module.exports = function rateLimitLogin(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 phút
  const maxAttempts = 5;

  if (!rateLimit[ip]) rateLimit[ip] = [];
  // Xóa các lần login cũ ngoài window
  rateLimit[ip] = rateLimit[ip].filter(ts => now - ts < windowMs);

  if (rateLimit[ip].length >= maxAttempts) {
    return res.status(429).json({ message: 'Quá nhiều lần đăng nhập, thử lại sau!' });
  }

  rateLimit[ip].push(now);
  next();
};