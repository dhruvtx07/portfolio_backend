const { body, param, validationResult } = require('express-validator');

const createSessionValidationRules = () => [
  body('visitorId')
    .notEmpty().withMessage('Visitor ID is required')
    .isString().withMessage('Visitor ID must be a string')
    .isLength({ max: 64 }).withMessage('Visitor ID cannot exceed 64 characters'),

  body('landingPage')
    .optional()
    .isString().withMessage('Landing page must be a string')
    .isLength({ max: 500 }).withMessage('Landing page cannot exceed 500 characters'),

  body('referrer')
    .optional({ nullable: true })
    .isString().withMessage('Referrer must be a string')
    .isLength({ max: 1000 }).withMessage('Referrer cannot exceed 1000 characters'),
];

const updateSessionValidationRules = () => [
  param('sessionId')
    .notEmpty().withMessage('Session ID is required')
    .isString().withMessage('Session ID must be a string'),

  body('lastPage')
    .optional()
    .isString().withMessage('Last page must be a string')
    .isLength({ max: 500 }).withMessage('Last page cannot exceed 500 characters'),

  body('endedAt')
    .optional({ nullable: true })
    .isISO8601().withMessage('Ended at must be a valid ISO 8601 date'),
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
  createSessionValidationRules,
  updateSessionValidationRules,
  validate,
};
