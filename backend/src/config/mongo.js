const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI;

const connectMongo = async () => {
  if (!mongoUri) throw new Error('MONGO_URI is missing');
  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGO_DB_NAME,
    user: process.env.MONGO_DB_USER,
    pass: process.env.MONGO_DB_PASSWORD,
  });
};

const disconnectMongo = () => mongoose.disconnect();

module.exports = { connectMongo, disconnectMongo };
