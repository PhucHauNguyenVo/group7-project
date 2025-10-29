const mongoose = require('mongoose');
const connectDB = require('../../config/db');

const connectMongo = async () => {
  await connectDB();
  return mongoose.connection;
};

const disconnectMongo = () => mongoose.disconnect();

module.exports = { connectMongo, disconnectMongo };
