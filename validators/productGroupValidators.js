const { body, validationResult } = require('express-validator');

const createProductGroupValidationRules = () => [
  body('store_id')
    .notEmpty().withMessage('Store ID is required')
    .isNumeric().withMessage('Store ID must be a number'),

  body('title')
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Title must be a string'),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),

  body('status')
    .optional()
    .isNumeric().withMessage('Status must be a number')
    .isIn(['1', '0']).withMessage('Status must be 1 or 0'),
];

const updateProductGroupValidationRules = () => [
  body('title')
    .optional()
    .isString().withMessage('Title must be a string'),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),

  body('status')
    .optional()
    .isNumeric().withMessage('Status must be a number')
    .isIn(['1', '0']).withMessage('Status must be 1 or 0'),
];

const addProductToGroupValidationRules = () => [
  body('products')
    .isArray({ min: 1 }).withMessage('products must be a non-empty array'),
  body('products.*.shopify_product_id')
    .notEmpty().withMessage('shopify_product_id is required for each product')
    .isString().withMessage('shopify_product_id must be a string'),
  body('products.*.option_selections')
    .optional()
    .isArray().withMessage('option_selections must be an array'),
  body('products.*.option_selections.*.name')
    .optional()
    .isString().withMessage('option name must be a string'),
  body('products.*.option_selections.*.values')
    .optional()
    .isArray().withMessage('option values must be an array'),
  body('products.*.option_selections.*.values.*.value')
    .optional()
    .isString().withMessage('Each option value must be a string'),
  body('products.*.option_selections.*.values.*.selected')
    .optional()
    .isBoolean().withMessage('selected must be a boolean'),
  body('products.*.option_selections.*.values.*.variant_ids')
    .optional()
    .isArray().withMessage('variant_ids must be an array'),
  body('products.*.option_selections.*.values.*.variant_ids.*')
    .optional()
    .isString().withMessage('Each variant_id must be a string'),
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
  createProductGroupValidationRules,
  updateProductGroupValidationRules,
  addProductToGroupValidationRules,
  validate,
};
