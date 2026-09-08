const { query, validationResult } = require('express-validator');

const analyticsQueryValidationRules = () => [
  query('from')
    .optional()
    .isISO8601().withMessage('From date must be a valid ISO 8601 string'),

  query('to')
    .optional()
    .isISO8601().withMessage('To date must be a valid ISO 8601 string'),

  query('page')
    .optional()
    .isString().withMessage('Page filter must be a string'),

  query('type')
    .optional()
    .isString().withMessage('Type filter must be a string'),

  query('device')
    .optional()
    .isString().withMessage('Device filter must be a string'),

  query('browser')
    .optional()
    .isString().withMessage('Browser filter must be a string'),

  query('os')
    .optional()
    .isString().withMessage('OS filter must be a string'),

  query('source')
    .optional()
    .isString().withMessage('Source filter must be a string'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().forEach(err => {
    const paramKey = err.path || err.param;
    if (paramKey) {
      extractedErrors.push({ [paramKey]: err.msg });
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
  analyticsQueryValidationRules,
  validate,
};
