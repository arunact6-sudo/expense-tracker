const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currency: { type: String, default: 'USD' },
  dateFormat: { type: String, default: 'MM/dd/yyyy' },
  language: { type: String, default: 'en' },
  notifications: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
