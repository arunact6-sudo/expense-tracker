const User = require('../models/User');
const Category = require('../models/Category');
const Setting = require('../models/Setting');
const bcrypt = require('bcryptjs');

const defaultCategories = [
  { name: 'Food & Dining', type: 'expense', icon: 'utensils', color: '#ef4444', isDefault: true, isSystem: true },
  { name: 'Travel', type: 'expense', icon: 'plane', color: '#3b82f6', isDefault: true, isSystem: true },
  { name: 'Fuel', type: 'expense', icon: 'gas-pump', color: '#f59e0b', isDefault: true, isSystem: true },
  { name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#ec4899', isDefault: true, isSystem: true },
  { name: 'Medical', type: 'expense', icon: 'heart-pulse', color: '#10b981', isDefault: true, isSystem: true },
  { name: 'Education', type: 'expense', icon: 'book', color: '#8b5cf6', isDefault: true, isSystem: true },
  { name: 'Rent', type: 'expense', icon: 'home', color: '#6366f1', isDefault: true, isSystem: true },
  { name: 'Utilities', type: 'expense', icon: 'zap', color: '#f97316', isDefault: true, isSystem: true },
  { name: 'Internet', type: 'expense', icon: 'wifi', color: '#06b6d4', isDefault: true, isSystem: true },
  { name: 'Entertainment', type: 'expense', icon: 'film', color: '#a855f7', isDefault: true, isSystem: true },
  { name: 'Insurance', type: 'expense', icon: 'shield', color: '#14b8a6', isDefault: true, isSystem: true },
  { name: 'Salary', type: 'income', icon: 'briefcase', color: '#22c55e', isDefault: true, isSystem: true },
  { name: 'Investment', type: 'income', icon: 'trending-up', color: '#0ea5e9', isDefault: true, isSystem: true },
  { name: 'Taxes', type: 'expense', icon: 'file-text', color: '#64748b', isDefault: true, isSystem: true },
  { name: 'Groceries', type: 'expense', icon: 'shopping-cart', color: '#84cc16', isDefault: true, isSystem: true },
  { name: 'Others', type: 'both', icon: 'more-horizontal', color: '#9ca3af', isDefault: true, isSystem: true }
];

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, securityQuestion, securityAnswer } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide name, email and password' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      securityQuestion,
      securityAnswer
    });

    const categories = defaultCategories.map(cat => ({
      ...cat,
      user: user._id
    }));
    await Category.insertMany(categories);

    await Setting.create({ user: user._id });

    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        preferences: user.preferences,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, error: 'Account has been deactivated. Please contact support.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = user.generateAuthToken();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        preferences: user.preferences,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (avatar) updateFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email, securityAnswer, newPassword } = req.body;

    if (!email || !securityAnswer || !newPassword) {
      return res.status(400).json({ success: false, error: 'Please provide email, security answer, and new password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+securityAnswer');
    if (!user) {
      return res.status(404).json({ success: false, error: 'No user found with this email' });
    }

    if (!user.securityQuestion || !user.securityAnswer) {
      return res.status(400).json({ success: false, error: 'No security question set for this account' });
    }

    const isMatch = await bcrypt.compare(securityAnswer.toLowerCase().trim(), user.securityAnswer);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect security answer' });
    }

    user.password = newPassword;
    user.securityAnswer = undefined;
    user.securityQuestion = undefined;
    await user.save();

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
