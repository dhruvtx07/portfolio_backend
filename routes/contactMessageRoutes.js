const express = require('express');
const router = express.Router();
const contactMessageController = require('../controllers/contactMessageController');
const { createContactMessageValidationRules, validate } = require('../validators/contactMessageValidators');
const { contactLimiter } = require('../middleware/rateLimitMiddleware');

router.post('/', contactLimiter, createContactMessageValidationRules(), validate, contactMessageController.createContactMessage);

module.exports = router;
