const { body, validationResult } = require('express-validator');
const { User } = require('../models'); // Adjust the path as needed
const { Op } = require('sequelize'); // Import Sequelize operators


const createUserValidationRules = () => [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('role_id').notEmpty().withMessage('Role is required').custom(async (value) => {
    const allowedRoles = [2,];
      if (!allowedRoles.includes(Number(value))) {
        throw new Error('Role is Invalid');
      }
      return true;
  }),
  body('email')
    .isEmail().withMessage('Email is invalid')
    .custom(async (value) => {
      const user = await User.findOne({ where: { email: value } });
      if (user) {
        throw new Error('Email already in use');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter'),

  body('store_name')
    .notEmpty().withMessage('Store name is required')
    .isString().withMessage('Store name must be a string'),
];

const updateUserValidationRules = () => [
  // Validate the email field
  body('email')
    .optional()
    .isEmail().withMessage('Email is invalid')
    .custom(async (value, { req }) => {
      const user = await User.findOne({
        where: { email: value, id: { [Op.ne]: req.params.id } },
      });
      if (user) {
        throw new Error('Email already in use');
      }
      return true;
    }),

  // Validate the password field
  body('password')
    .optional({ checkFalsy: true }) // Allows empty or falsy values to skip validation
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter'),
];

const forgotPasswordValidationRules = () => [
  body('email')
    .isEmail().withMessage('Email is invalid')
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

const changePasswordValidationRules = () => [
  body('current_password')
    .optional() // Make it optional
    .notEmpty().withMessage('Current password is required'),

  body('new_password')
    .optional() // Make it optional
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
    .matches(/\d/).withMessage('New password must contain a number')
    .matches(/[A-Z]/).withMessage('New password must contain an uppercase letter'),

  body('first_name')
    .notEmpty().withMessage('First name is required'),

  body('last_name')
    .notEmpty().withMessage('Last name is required'),
];

module.exports = {
  createUserValidationRules,
  updateUserValidationRules,
  forgotPasswordValidationRules,
  validate,
  changePasswordValidationRules,
};
