const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require(path.join(__dirname, 'routes', 'auth'));
const userRoutes = require(path.join(__dirname, 'routes', 'user'));

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  try {
    console.log(`--> ${req.method} ${req.originalUrl}`);
    if (req.method === 'POST' || req.method === 'PUT') {
      console.log('    body:', JSON.stringify(req.body));
    }
  } catch (err) {
    console.warn('Request logging failed:', err instanceof Error ? err.message : err);
  }
  next();
});

app.get('/', (req, res) => {
  res.send('Server is running successfully with authentication and CRUD APIs.');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongooseReadyState: mongoose.connection.readyState,
  });
});

const buildMongoUri = () => {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;
  const { MONGO_USER, MONGO_PASS, MONGO_HOST, MONGO_DB, MONGO_OPTIONS } = process.env;
  if (!MONGO_HOST || !MONGO_DB) {
    throw new Error('Missing MongoDB configuration. Provide MONGO_URI or host/database env vars.');
  }
  const auth = MONGO_USER ? `${encodeURIComponent(MONGO_USER)}:${encodeURIComponent(MONGO_PASS || '')}@` : '';
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
  const timeout = Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 5000;
  const options = { serverSelectionTimeoutMS: timeout };
  if (!isMongoSrv) {
    options.authSource = process.env.MONGO_AUTH_SOURCE || 'admin';
  }
  if (process.env.MONGO_DIRECT_CONNECTION === 'true') {
    options.directConnection = true;
  }
  return options;
};

mongoose.set('strictQuery', false);
mongoose.set('bufferTimeoutMS', 60000);

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err instanceof Error ? err.message : err);
});
mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected from MongoDB');
});

mongoose
  .connect(mongoUri, getMongoOptions())
  .then(() => {
    console.log('MongoDB connected successfully');
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log('mongoose.readyState at server start =', mongoose.connection.readyState);
    });
  })
  .catch((err) => {
    const errMsg = err instanceof Error ? err.message : err;
    console.error('MongoDB connection error:', errMsg);
    console.error('Server not started because DB connection failed.');
    process.exit(1);
  });
