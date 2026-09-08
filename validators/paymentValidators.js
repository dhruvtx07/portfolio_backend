const { body, param } = require('express-validator');

const storePaymentSettingsValidationRules = () => [
  body('payment_method').isIn(['check', 'paypal']).withMessage('Invalid payment method.'),
  
  body('store_id').notEmpty().withMessage('store_id is required.').isInt(),

  // Check validations
  body('firstname').if(body('payment_method').equals('check')).notEmpty().withMessage('firstname is required.'),
  body('lastname').if(body('payment_method').equals('check')).notEmpty().withMessage('lastname is required.'),
  body('email').if(body('payment_method').equals('check')).notEmpty().withMessage('email is required.').isEmail().withMessage('email is invalid.'),
  body('phone').if(body('payment_method').equals('check')).notEmpty().withMessage('phone is required.'),
  body('fullname').if(body('payment_method').equals('check')).notEmpty().withMessage('fullname is required.'),
  body('address1').if(body('payment_method').equals('check')).notEmpty().withMessage('address1 is required.'),
  body('city').if(body('payment_method').equals('check')).notEmpty().withMessage('city is required.'),
  body('state').if(body('payment_method').equals('check')).notEmpty().withMessage('state is required.'),
  body('country').if(body('payment_method').equals('check')).notEmpty().withMessage('country is required.'),
  body('zip_code').if(body('payment_method').equals('check')).notEmpty().withMessage('zip_code is required.'),
  
  // Paypal validations
  body('store_business_email').if((value, { req }) => req.body.payment_method === 'paypal' && req.body.store_id).notEmpty().withMessage('Business Email is required.').isEmail().withMessage('Business Email is invalid.'),
  
];

const makeCheckPaymentValidationRules = () => [
  body('store_id').notEmpty().withMessage('store_id is required.').isInt(),
  body('amount').notEmpty().withMessage('amount is required.')
    .isFloat({ gt: 0 }).withMessage('amount must be greater than 0.')
];

const transactionHistoryValidationRules = () => [
  body('store_id').notEmpty().withMessage('store_id is required.').isInt(),
  body('cursor').optional().isString().withMessage('cursor must be a string.'),
  body('limit').optional().isInt({ min: 1 }).withMessage('limit must be a positive integer.')
];

module.exports = {
  storePaymentSettingsValidationRules,
  makeCheckPaymentValidationRules,
  transactionHistoryValidationRules
};
