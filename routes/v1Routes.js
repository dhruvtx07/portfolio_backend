const express = require('express');
const router = express.Router();

const healthRoutes = require('./healthRoutes');
const sessionRoutes = require('./sessionRoutes');
const eventRoutes = require('./eventRoutes');
const contactMessageRoutes = require('./contactMessageRoutes');
const authRoutes = require('./authRoutes');
const analyticsRoutes = require('./analyticsRoutes');

// Public endpoints
router.use('/health', healthRoutes);
router.use('/sessions', sessionRoutes);
router.use('/events', eventRoutes);
router.use('/contact-messages', contactMessageRoutes);
router.use('/auth', authRoutes);

// Private analytics endpoints
router.use('/analytics', analyticsRoutes);

module.exports = router;
