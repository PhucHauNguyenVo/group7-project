<<<<<<< HEAD
// 🌟 Nạp các thư viện cần thiết
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// 🌟 Import các routes
const authRoutes = require(path.join(__dirname, 'routes', 'auth'));
const userRoutes = require(path.join(__dirname, 'routes', 'user'));

const app = express();
const PORT = process.env.PORT || 4000;

// ⚙️ Middleware
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug request
app.use((req, res, next) => {
  try {
    console.log(`--> ${req.method} ${req.originalUrl}`);
    if (req.method === 'POST' || req.method === 'PUT') {
      console.log('    body:', JSON.stringify(req.body));
    }
  } catch {}
  next();
});

// Root route (keep lightweight)
app.get('/', (req, res) => {
  res.send('🚀 Server is running successfully with Authentication + CRUD!');
});

// Health endpoint to inspect DB connection quickly
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongooseReadyState: mongoose.connection.readyState
  });
});

// ---------------------------------------------------------
// ✅ Cấu hình Mongoose (Cách 1 — tăng timeout, tránh lỗi buffering)
// ---------------------------------------------------------
mongoose.set('strictQuery', false);          // tắt cảnh báo query strict
mongoose.set('bufferTimeoutMS', 60000);      // tăng thời gian chờ đệm lên 60 giây

const mongooseConnectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 60000,  // tăng thời gian chờ chọn server
  connectTimeoutMS: 60000           // tăng thời gian chờ kết nối
};

// Log trạng thái kết nối
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});
mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err?.message || err);
});
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose disconnected from MongoDB');
});

// ---------------------------------------------------------
// 🔗 Kết nối MongoDB và khởi động server
// ---------------------------------------------------------
mongoose.connect(process.env.MONGO_URI, mongooseConnectOptions)
  .then(() => {
    console.log('✅ MongoDB connected successfully');

    // Mount routes only after DB connected to avoid buffering issues
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log('🛠️ mongoose.readyState at server start =', mongoose.connection.readyState);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    console.error('❌ Server not started because DB connection failed.');
  });

=======
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

const buildMongoUri = () => {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;
  const { MONGO_USER, MONGO_PASS, MONGO_HOST, MONGO_DB, MONGO_OPTIONS } = process.env;
  if (!MONGO_HOST || !MONGO_DB) {
    throw new Error('Missing MongoDB configuration. Provide MONGO_URI or host/database env vars.');
  }
  const auth =
    MONGO_USER
      ? `${encodeURIComponent(MONGO_USER)}:${encodeURIComponent(MONGO_PASS || '')}@`
      : '';
  const options = MONGO_OPTIONS ? `?${MONGO_OPTIONS}` : '';
  return `mongodb://${auth}${MONGO_HOST}/${MONGO_DB}${options}`;
};

let mongoUri = buildMongoUri();

const appendQueryParam = (uri, key, value) => {
  const separator = uri.includes('?') ? '&' : '?';
  return `${uri}${separator}${key}=${encodeURIComponent(value)}`;
};

const isMongoSrv = mongoUri.startsWith('mongodb+srv://');
if (process.env.MONGO_AUTH_SOURCE && !isMongoSrv && !/authSource=/.test(mongoUri)) {
  mongoUri = appendQueryParam(mongoUri, 'authSource', process.env.MONGO_AUTH_SOURCE);
}

const sanitizedMongoUri = mongoUri.replace(/\/\/([^:@]+):[^@]*@/, '//$1:***@');
console.log('Connecting to MongoDB using URI:', sanitizedMongoUri);

const getMongoOptions = () => {
  const options = { serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 5000 };
  if (!isMongoSrv) {
    options.authSource = process.env.MONGO_AUTH_SOURCE || 'admin';
  }
  return options;
};

const connectMongo = () => mongoose.connect(mongoUri, getMongoOptions());

app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cố gắng load router, nếu thiếu sẽ log rõ để debug
let userRoutes;
try {
  userRoutes = require('./routes/user');
} catch (err) {
  console.error('Cannot load ./routes/user - check file path and name:', err && err.message ? err.message : err);
  // fallback: empty router để server không crash
  const r = express.Router();
  r.get('/', (req, res) => res.json({ message: 'routes/user missing' }));
  userRoutes = r;
}

app.use(['/api', '/'], userRoutes);

connectMongo()
  .then(() => {
    console.log('MongoDB connected');
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    const errMsg = err && err.message ? err.message : err;
    console.error('MongoDB connection failed:', errMsg);
    console.error('❌ MongoDB connection error:', errMsg);
    process.exit(1);
  });
>>>>>>> origin/database
