const path = require('path');
const crypto = require('crypto');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');

const divider = (label) => {
  const bar = '-'.repeat(label.length + 8);
  console.log(`\n${bar}`);
  console.log(`>>> ${label} <<<`);
  console.log(bar);
};

const run = async () => {
  try {
    divider('Connecting to MongoDB');
    await connectDB();

    divider('Creating temporary user');
    const tempEmail = `test_refresh_${Date.now()}@example.com`;
    const tempUser = await User.create({
      name: 'Refresh Token Tester',
      email: tempEmail,
      password: crypto.randomBytes(16).toString('hex'),
    });
    console.log('Temporary user created:', tempUser._id.toString());

    divider('Saving refresh token');
    const tokenValue = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const createdToken = await RefreshToken.create({
      user: tempUser._id,
      token: tokenValue,
      expiresAt,
      userAgent: 'automation-script',
      ipAddress: '127.0.0.1',
    });
    console.log('Refresh token stored with id:', createdToken._id.toString());

    divider('Fetching refresh token');
    const fetchedToken = await RefreshToken.findOne({ token: tokenValue }).populate('user', 'email name');
    if (!fetchedToken) {
      throw new Error('Failed to retrieve refresh token.');
    }
    console.log('Fetched token belongs to user:', fetchedToken.user.email);

    divider('Deleting refresh token');
    const deleteResult = await RefreshToken.deleteOne({ _id: createdToken._id });
    console.log('Delete acknowledged:', deleteResult.acknowledged);
    console.log('Documents deleted:', deleteResult.deletedCount);

    divider('Cleaning up temporary user');
    await User.deleteOne({ _id: tempUser._id });
    console.log('Temporary user removed.');

    divider('Verification');
    const shouldBeMissing = await RefreshToken.findById(createdToken._id);
    console.log('Refresh token still exists?', Boolean(shouldBeMissing));

    divider('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error instanceof Error ? error.message : error);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed.');
  }
};

run();
