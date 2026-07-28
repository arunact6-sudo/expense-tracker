const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'danger'], default: 'info' },
  module: { type: String, enum: ['bill', 'budget', 'savings_goal', 'recurring', 'system'] },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ user: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
