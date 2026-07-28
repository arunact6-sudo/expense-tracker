const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  theme: { type: String, default: 'light', enum: ['light', 'dark', 'system'] },
  currency: { type: String, default: 'USD' },
  language: { type: String, default: 'en' },
  dateFormat: { type: String, default: 'MM/DD/YYYY' },
  notificationsEnabled: { type: Boolean, default: true },
  backupData: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
