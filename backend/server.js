const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
  console.log(`--> ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/', (req, res) => res.send('Server is running'));

// Helper to build Mongo URI from parts (fallback)
const buildMongoUri = () => {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;
  const { MONGO_USER, MONGO_PASS, MONGO_HOST, MONGO_DB, MONGO_OPTIONS } = process.env; 
  if (!MONGO_HOST || !MONGO_DB) return null;
  const auth = MONGO_USER ? `${encodeURIComponent(MONGO_USER)}:${encodeURIComponent(MONGO_PASS||'')}@` : '';
  const options = MONGO_OPTIONS ? `?${MONGO_OPTIONS}` : '';
  return `mongodb://${auth}${MONGO_HOST}/${MONGO_DB}${options}`;
};

const mongoUri = buildMongoUri() || process.env.MONGO_URI;

mongoose.set('strictQuery', false);
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 30000,
  connectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS) || 30000,
};

mongoose.connection.on('connected', () => console.log('Mongoose connected'));
mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err && err.message ? err.message : err));

// Mount routes
const authRoutes = require(path.join(__dirname, 'routes', 'auth'));
const userRoutes = require(path.join(__dirname, 'routes', 'user'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

if (!mongoUri) {
  console.error('MongoDB URI not provided. Set MONGO_URI or related env vars.');
  process.exit(1);
}

mongoose.connect(mongoUri, mongooseOptions)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, '0.0.0.0', () => console.log(`Server listening on ${PORT}`));
  })
  .catch(err => {
    console.error('Failed to connect MongoDB:', err && err.message ? err.message : err);
    process.exit(1);
  });

module.exports = app;
