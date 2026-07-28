const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['income', 'expense', 'both'], default: 'both' },
  icon: { type: String, default: 'folder' },
  color: { type: String, default: '#6366f1' },
  isDefault: { type: Boolean, default: false },
  isSystem: { type: Boolean, default: false }
}, { timestamps: true });

categorySchema.index({ user: 1 });
categorySchema.index({ isSystem: 1 });

module.exports = mongoose.model('Category', categorySchema);
