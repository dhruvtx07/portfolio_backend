const { body, validationResult } = require('express-validator');

const ALLOWED_EVENT_TYPES = [
  'page_view',
  'project_view',
  'outbound_click',
  'resume_download',
  'contact_click',
  'scroll_depth',
  'section_view',
  'github_click',
  'linkedin_click',
  'email_click',
  'theme_change',
  'project_demo_click'
];

const createEventValidationRules = () => [
  body('sessionId')
    .notEmpty().withMessage('Session ID is required')
    .isString().withMessage('Session ID must be a string'),

  body('type')
    .notEmpty().withMessage('Event type is required')
    .isString().withMessage('Event type must be a string')
    .isLength({ max: 50 }).withMessage('Event type cannot exceed 50 characters')
    .custom((value) => {
      if (!ALLOWED_EVENT_TYPES.includes(value) && !/^[a-z0-9_.-]+$/i.test(value)) {
        throw new Error('Event type contains invalid characters');
      }
      return true;
    }),

  body('page')
    .notEmpty().withMessage('Page is required')
    .isString().withMessage('Page must be a string')
    .isLength({ max: 500 }).withMessage('Page cannot exceed 500 characters'),

  body('metadata')
    .optional({ nullable: true })
    .isObject().withMessage('Metadata must be a valid JSON object'),
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
  createEventValidationRules,
  validate,
  ALLOWED_EVENT_TYPES
};
