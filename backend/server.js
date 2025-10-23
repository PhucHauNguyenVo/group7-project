// ===========================================================
// 🌟 SERVER.JS — BACKEND BUỔI 5: USER MANAGEMENT FULL
// ===========================================================

// 🌟 Nạp các thư viện cần thiết
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// 🌟 Import các routes
const authRoutes = require(path.join(__dirname, 'routes', 'auth'));
const userRoutes = require(path.join(__dirname, 'routes', 'user'));

// 🌟 Khởi tạo app Express
const app = express();
const PORT = process.env.PORT || 4000;

// ===========================================================
// ⚙️ Middleware toàn cục
// ===========================================================
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug log cho mỗi request
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    console.log('   📦 Body:', req.body);
  }
  next();
});

// ===========================================================
// 🏠 Route cơ bản
// ===========================================================
app.get('/', (req, res) => {
  res.send('🚀 Server is running successfully with Authentication + CRUD!');
});

// Health check để kiểm tra nhanh trạng thái DB
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongooseReadyState: mongoose.connection.readyState,
  });
});

// ===========================================================
// 🗄️ Cấu hình Mongoose — tránh lỗi timeout & buffering
// ===========================================================
mongoose.set('strictQuery', false);
mongoose.set('bufferTimeoutMS', 60000);

const mongooseConnectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 60000,
  connectTimeoutMS: 60000,
};

// Log sự kiện kết nối MongoDB
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});
mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err?.message || err);
});
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose disconnected from MongoDB');
});

// ===========================================================
// 🔗 Kết nối tới MongoDB và khởi động server
// ===========================================================
mongoose
  .connect(process.env.MONGO_URI, mongooseConnectOptions)
  .then(() => {
    console.log('✅ MongoDB connected successfully');

    // Mount routes sau khi DB đã kết nối
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);

    // Khởi động server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log('🧠 mongoose.readyState =', mongoose.connection.readyState);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    console.error('❌ Server not started because DB connection failed.');
  });
