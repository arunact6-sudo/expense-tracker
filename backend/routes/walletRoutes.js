const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const walletController = require('../controllers/walletController');

router.use(protect);

router.get('/summary', walletController.getWalletSummary);

router.get('/', walletController.getWallets);

router.post('/', [
  body('name').notEmpty().withMessage('Wallet name is required')
], validate, walletController.createWallet);

router.put('/:id', walletController.updateWallet);

router.delete('/:id', walletController.deleteWallet);

router.post('/transfer', [
  body('fromWalletId').notEmpty().withMessage('Source wallet is required'),
  body('toWalletId').notEmpty().withMessage('Destination wallet is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than zero')
], validate, walletController.transferBetweenWallets);

module.exports = router;
