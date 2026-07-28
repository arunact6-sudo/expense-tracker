const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  icon: { type: String, default: 'target' },
  color: { type: String, default: '#6366f1' },
  deadline: { type: Date },
  category: {
    type: String,
    enum: ['vacation', 'car', 'emergency_fund', 'house', 'education', 'custom'],
    default: 'custom'
  },
  isCompleted: { type: Boolean, default: false },
  completedDate: { type: Date }
}, { timestamps: true });

savingsGoalSchema.index({ user: 1 });

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
