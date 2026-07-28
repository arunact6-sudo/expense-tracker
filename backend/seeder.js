require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');

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

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker');
    console.log('MongoDB connected for seeding...');

    await Category.deleteMany({ isSystem: true });
    console.log('Cleared existing system categories');

    const result = await Category.insertMany(defaultCategories);
    console.log(`Seeded ${result.length} system categories successfully`);

    console.log('\nSeeded categories:');
    result.forEach(c => console.log(`  - ${c.name} (${c.type}) [${c.color}]`));

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedDB();
