require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/userModel');

(async function(){
  try {
    console.log('Connecting using MONGO_URI:', !!process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000, connectTimeoutMS:10000 });
    console.log('Connected, readyState=', mongoose.connection.readyState);
    const u = await User.findOne({ email: 'testquery@example.com' });
    console.log('findOne result =', u);
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('TestQuery Error:', err && err.message ? err.message : err);
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
