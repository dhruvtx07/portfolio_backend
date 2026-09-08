const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginValidationRules, validate } = require('../validators/authValidators');
const { loginLimiter } = require('../middleware/rateLimitMiddleware');

router.post('/login', loginLimiter, loginValidationRules(), validate, authController.login);

module.exports = router;
