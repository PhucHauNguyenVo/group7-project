require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let userRoutes;
try {
  userRoutes = require('./routes/user');
} catch (err) {
  console.error('Cannot load ./routes/user - check file path and name:', err.message || err);
  const fallback = express.Router();
  fallback.get('/', (_req, res) => res.json({ message: 'routes/user missing' }));
  userRoutes = fallback;
}

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('❌ Missing MONGO_URI in environment variables');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

app.get('/', (_req, res) => res.send('Server is running 🚀'));
app.use(['/api/users', '/api'], userRoutes);

