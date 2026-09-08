const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { createStoreValidationRules, updateStoreValidationRules, toggleStoreStatusValidationRules, searchStoreValidationRules, validate } = require('../validators/storeValidators');

router.get('/', storeController.getAllStores);
router.get('/search', searchStoreValidationRules(), validate, storeController.searchStores);

// router.get('/:id', storeController.getStoreById);
router.post('/add', createStoreValidationRules(), validate, storeController.createStore);
router.put('/update-store-profile/:id', updateStoreValidationRules(), validate, storeController.updateStore);
//router.put('/update-payment-state/:id', updatePaymentStateValidationRules(), validate, storeController.updateStorePaymentState);
router.put('/togglestatus/:id', toggleStoreStatusValidationRules(), validate, storeController.toggleStoreStatus);

router.put('/upload-logo/:id', upload, storeController.uploadStoreLogo);
router.put('/:id/commission', storeController.calculateCommission);

module.exports = router;