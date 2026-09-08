const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { analyticsQueryValidationRules, validate } = require('../validators/analyticsValidators');
const { verifyAndRefreshToken } = require('../middleware/auth');

router.get('/overview', verifyAndRefreshToken, analyticsQueryValidationRules(), validate, analyticsController.getOverview);
router.get('/pages', verifyAndRefreshToken, analyticsQueryValidationRules(), validate, analyticsController.getPages);
router.get('/events', verifyAndRefreshToken, analyticsQueryValidationRules(), validate, analyticsController.getEvents);
router.get('/devices', verifyAndRefreshToken, analyticsQueryValidationRules(), validate, analyticsController.getDevices);
router.get('/referrers', verifyAndRefreshToken, analyticsQueryValidationRules(), validate, analyticsController.getReferrers);

module.exports = router;
