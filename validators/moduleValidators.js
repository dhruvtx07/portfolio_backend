const { body, param, validationResult } = require('express-validator');

const createModuleValidationRules = () => [
  body('title').notEmpty().withMessage('Module title is required'),
  body('url').notEmpty().withMessage('URL is required')
];

const updateModuleValidationRules = () => [
  param('id').isInt().withMessage('Module ID must be an integer'),
  body('title').optional().notEmpty().withMessage('Module title is required'),
  body('url').optional().notEmpty().withMessage('URL is required')
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
  createModuleValidationRules,
  updateModuleValidationRules,
  validate,
};
