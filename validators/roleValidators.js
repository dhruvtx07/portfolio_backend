const { body, param, validationResult } = require('express-validator');

const createRoleValidationRules = () => [
  body('role_name').notEmpty().withMessage('Role name is required'),
];

const updateRoleValidationRules = () => [
  param('id').notEmpty().withMessage('Role ID is required').isInt().withMessage('Role ID must be an integer'),
  body('role_name').optional().notEmpty().withMessage('Role name is required'),
];

const assignOrUnassignRoleToUserValidationRules = () => [
  body('user_id').notEmpty().withMessage('User ID is required').isInt().withMessage('User ID must be an integer'),
  body('role_id').notEmpty().withMessage('Role ID is required').isInt().withMessage('Role ID must be an integer'),
];

const switchRoleValidationRules = () => [
  body('user_id').notEmpty().withMessage('User ID is required').isInt().withMessage('User ID must be an integer'),
  body('role_id').notEmpty().withMessage('Role ID is required').isInt().withMessage('Role ID must be an integer'),
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
  createRoleValidationRules,
  updateRoleValidationRules,
  assignOrUnassignRoleToUserValidationRules,
  switchRoleValidationRules,
  validate,
};
