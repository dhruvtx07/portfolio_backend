const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { createEventValidationRules, validate } = require('../validators/eventValidators');
const { analyticsEventLimiter } = require('../middleware/rateLimitMiddleware');

router.post('/', analyticsEventLimiter, createEventValidationRules(), validate, eventController.recordEvent);

module.exports = router;
