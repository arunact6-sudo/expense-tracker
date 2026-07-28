const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const { type, search } = req.query;
    const query = { $or: [{ user: req.user._id }, { isSystem: true }] };

    if (type) {
      query.$and = query.$and || [];
      query.$and.push({ $or: [{ type }, { type: 'both' }] });
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const categories = await Category.find(query).sort({ isSystem: -1, name: 1 });
    res.json({ success: true, data: categories, count: categories.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }

    const existing = await Category.findOne({ user: req.user._id, name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Category with this name already exists' });
    }

    const category = await Category.create({
      user: req.user._id,
      name,
      type: type || 'both',
      icon: icon || 'folder',
      color: color || '#6366f1',
      isDefault: false,
      isSystem: false
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    if (category.isSystem) {
      return res.status(400).json({ success: false, error: 'Cannot modify system categories' });
    }

    if (category.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this category' });
    }

    const { name, type, icon, color } = req.body;
    if (name) category.name = name;
    if (type) category.type = type;
    if (icon) category.icon = icon;
    if (color) category.color = color;

    await category.save();
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    if (category.isSystem) {
      return res.status(400).json({ success: false, error: 'Cannot delete system categories' });
    }

    if (category.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this category' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDefaultCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isSystem: true }).sort({ name: 1 });
    res.json({ success: true, data: categories, count: categories.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
