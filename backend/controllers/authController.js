const User = require('../models/userModel');
const RefreshToken = require('../models/RefreshToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generateTokens = async (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_EXPIRES || '15m' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES || '7d' });
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await RefreshToken.deleteMany({ userId }).catch(()=>{});
  const expiresAt = new Date(Date.now() + (parseInt(process.env.REFRESH_EXPIRES_DAYS || '7') * 24 * 60 * 60 * 1000));
  await RefreshToken.create({ userId, token: refreshTokenHash, expiresAt }).catch(()=>{});
  return { accessToken, refreshToken };
};

exports.signup = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const displayName = (name || username || '').trim();
    if (!displayName) return res.status(400).json({ message: 'Please provide a display name' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const safeRole = User.USER_ROLES && User.USER_ROLES.includes(role) ? role : undefined;
    const user = await User.create({ name: displayName, username, email, password: hashed, ...(safeRole ? { role: safeRole } : {}) });
    res.status(201).json({ message: 'Signup success', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { console.error('signup err', err); res.status(500).json({ message: 'Server error' }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const { accessToken, refreshToken } = await generateTokens(user._id);
    res.json({ message: 'Login success', accessToken, refreshToken, user: { id: user._id, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) { console.error('login err', err); res.status(500).json({ message: 'Server error' }); }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email not found' });
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordToken = resetHash;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();
    const clientBase = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientBase.replace(/\/?$/, '')}/reset-password/${resetToken}`;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
      const mailOptions = { from: process.env.EMAIL_FROM || process.env.EMAIL_USER, to: user.email, subject: 'Reset password', html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Expires in 15 minutes.</p>` };
      await transporter.sendMail(mailOptions).catch(err => console.error('mail err', err));
    }
    res.json({ message: 'Password reset email (if configured) sent', resetUrl });
  } catch (err) { console.error('forgot err', err); res.status(500).json({ message: 'Server error' }); }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Missing refresh token' });
    const incomingHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const stored = await RefreshToken.findOne({ token: incomingHash });
    if (!stored) return res.status(403).json({ message: 'Invalid refresh token' });
    if (stored.expiresAt < new Date()) { await RefreshToken.deleteOne({ token: incomingHash }); return res.status(403).json({ message: 'Refresh token expired' }); }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    await RefreshToken.deleteOne({ token: incomingHash }).catch(() => {});
    const { accessToken, refreshToken: newRefresh } = await generateTokens(decoded.userId);
    res.json({ message: 'Token refreshed', accessToken, refreshToken: newRefresh });
  } catch (err) { console.error('refresh err', err); res.status(403).json({ message: 'Refresh token invalid' }); }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const incomingHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await RefreshToken.deleteOne({ token: incomingHash }).catch(() => {});
    }
    res.json({ message: 'Logged out' });
  } catch (err) { console.error('logout err', err); res.status(500).json({ message: 'Server error' }); }
};
