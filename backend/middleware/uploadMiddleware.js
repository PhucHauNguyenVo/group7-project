// ==========================================
// 📦 Middleware xử lý upload file bằng multer
// ==========================================
const multer = require('multer');

// Lưu file trong RAM thay vì ổ cứng
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn tối đa 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('❌ Chỉ được upload file ảnh!'), false);
    }
    cb(null, true);
  },
});

module.exports = upload;
