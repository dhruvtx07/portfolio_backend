const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const {
  createSessionValidationRules,
  updateSessionValidationRules,
  validate
} = require('../validators/sessionValidators');
const { sessionLimiter } = require('../middleware/rateLimitMiddleware');

router.post('/', sessionLimiter, createSessionValidationRules(), validate, sessionController.createSession);
router.patch('/:sessionId', updateSessionValidationRules(), validate, sessionController.updateSession);

module.exports = router;
