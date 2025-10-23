require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');

const opts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000
};

console.log('Using MONGO_URI:', !!process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, opts)
  .then(() => {
    console.log('CONNECT_OK');
    return mongoose.connection.close();
  })
  .then(() => process.exit(0))
  .catch(err => {
    console.error('CONNECT_ERR', err && err.message ? err.message : err);
    process.exit(1);
  });
