const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

router.use(protect);

router.get('/', categoryController.getCategories);

router.get('/defaults', categoryController.getDefaultCategories);

router.post('/', [
  body('name').notEmpty().withMessage('Category name is required')
], validate, categoryController.createCategory);

router.put('/:id', categoryController.updateCategory);

router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
