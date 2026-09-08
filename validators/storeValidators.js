const { body, param, query, validationResult } = require('express-validator');

const createStoreValidationRules = () => [
  body('user_storeowner_id')
    .notEmpty().withMessage('Store owner is required')
    .isNumeric().withMessage('Store owner ID must be a number'),

  body('store_name')
    .notEmpty().withMessage('Store name is required')
    .isString().withMessage('Store name must be a string'),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),

  body('slug')
    .optional()
    .isString().withMessage('Slug must be a string'),

  body('logo')
    .optional()
    .isString().withMessage('Logo must be a string'),

  body('commission_rate')
    .optional()
    .isNumeric().withMessage('Commission rate must be a number'),

  body('status')
    .optional()
    .isNumeric().withMessage('Status must be a number')
    .isIn([0, 1]).withMessage('Status must be 0 or 1'),
];

const updateStoreValidationRules = () => [
  body('user_storeowner_id')
    .optional()
    .isNumeric().withMessage('Store owner ID must be a number'),

  body('name')
    .optional()
    .isString().withMessage('Store name must be a string'),

  body('slug')
    .optional()
    .isString().withMessage('Slug must be a string'),

  body('logo')
    .optional()
    .isString().withMessage('Logo must be a string'),

  body('commission_rate')
    .optional()
    .isNumeric().withMessage('Commission rate must be a number'),

  body('status')
    .optional()
    .isNumeric().withMessage('Status must be a number')
    .isIn([0, 1]).withMessage('Status must be 0 or 1'),

  body('first_name')
    .optional()
    .isString().withMessage('First name must be a string'),

  body('last_name')
    .optional()
    .isString().withMessage('Last name must be a string'),

  body('email')
    .optional()
    .isEmail().withMessage('Must be a valid email address'),

  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const toggleStoreStatusValidationRules = () => [
  body('status')
    .notEmpty().withMessage('status is required')
    .isIn([0, 1, '0', '1']).withMessage('status must be 0 or 1'),
];
/*
const updatePaymentStateValidationRules = () => [
  param('id')
    .notEmpty().withMessage('ID is required')
    .isNumeric().withMessage('ID must be a number'),

  body('payment_state')
    .notEmpty().withMessage('Payment state is required')
    .isString().withMessage('Payment state must be a string')
    .isIn(['FAILED', 'PASSED']).withMessage('Payment state must be either FAILED or PASSED'),
];
*/

const searchStoreValidationRules = () => [
  query('term')
    .optional()
    .isString().withMessage('Search query must be a string'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().forEach(err => {
    if (err.param) {
      extractedErrors.push({ [err.param]: err.msg });
    } else {
      extractedErrors.push({ error: err.msg });
    }
  });

  return res.status(422).json({
    success: false,
    errors: extractedErrors,
  });
};

module.exports = {
  createStoreValidationRules,
  updateStoreValidationRules,
  toggleStoreStatusValidationRules,
  //updatePaymentStateValidationRules,
  searchStoreValidationRules,
  validate,
};