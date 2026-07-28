const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  phone: { type: String, trim: true },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  securityQuestion: { type: String },
  securityAnswer: { type: String, select: false },
  preferences: {
    theme: { type: String, default: 'light', enum: ['light', 'dark', 'system'] },
    currency: { type: String, default: 'USD' },
    language: { type: String, default: 'en' },
    dateFormat: { type: String, default: 'MM/DD/YYYY' },
    notifications: { type: Boolean, default: true }
  },
  lastLogin: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('securityAnswer') || !this.securityAnswer) return next();
  const salt = await bcrypt.genSalt(10);
  this.securityAnswer = await bcrypt.hash(this.securityAnswer, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET || 'expense-tracker-super-secret-key-2024-local', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

module.exports = mongoose.model('User', userSchema);
