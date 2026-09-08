const { body, validationResult } = require('express-validator');

const createContactMessageValidationRules = () => [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .isLength({ max: 255 }).withMessage('Email cannot exceed 255 characters'),

  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isString().withMessage('Message must be a string')
    .isLength({ min: 5, max: 5000 }).withMessage('Message must be between 5 and 5000 characters'),
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
  createContactMessageValidationRules,
  validate,
};
