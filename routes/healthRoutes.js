const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const { publicLimit } = require('../middleware/rateLimitMiddleware');

router.get('/', publicLimit, healthController.getHealth);

module.exports = router;
