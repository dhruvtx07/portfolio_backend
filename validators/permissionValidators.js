const { body, param, validationResult } = require('express-validator');
const { Role, Module, ModulesPermissions } = require('../models');

const createPermissionValidationRules = () => [
  body('role_id').notEmpty().withMessage('Role ID is required').isInt().withMessage('Role ID must be an integer').custom(async (value) => {
    const role = await Role.findByPk(value);
    if (!role) {
      throw new Error('Invalid Role ID');
    }
  }),
  body('module_id').notEmpty().withMessage('Module ID is required').isInt().withMessage('Module ID must be an integer').custom(async (value) => {
    const module = await Module.findByPk(value);
    if (!module) {
      throw new Error('Invalid Module ID');
    }
  }),
  body('add').isBoolean().withMessage('Add permission must be a boolean value'),
  body('update').isBoolean().withMessage('Update permission must be a boolean value'),
  body('delete').isBoolean().withMessage('Delete permission must be a boolean value'),
  body('view').isBoolean().withMessage('View permission must be a boolean value'),
];

const updatePermissionValidationRules = () => [
  param('id').notEmpty().withMessage('Permission ID is required').isInt().withMessage('Permission ID must be an integer'),
  body('role_id').optional().isInt().withMessage('Role ID must be an integer').custom(async (value) => {
    if (value !== undefined) {
      const role = await Role.findByPk(value);
      if (!role) {
        throw new Error('Invalid Role ID');
      }
    }
  }),
  body('module_id').optional().isInt().withMessage('Module ID must be an integer').custom(async (value) => {
    if (value !== undefined) {
      const module = await Module.findByPk(value);
      if (!module) {
        throw new Error('Invalid Module ID');
      }
    }
  }),
  body('add').optional().isBoolean().withMessage('Add permission must be a boolean value'),
  body('update').optional().isBoolean().withMessage('Update permission must be a boolean value'),
  body('delete').optional().isBoolean().withMessage('Delete permission must be a boolean value'),
  body('view').optional().isBoolean().withMessage('View permission must be a boolean value'),
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
  createPermissionValidationRules,
  updatePermissionValidationRules,
  validate,
};
