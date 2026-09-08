const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const v1Routes = require('./v1Routes');
const { verifyAndRefreshToken } = require('../middleware/auth');
const { sequelize } = require('../models');

const usersController = require('../controllers/usersController');

const { createUserValidationRules, validate } = require('../validators/userValidators');

const roleRoutes = require('./roleRoutes');
const modulesRoutes = require('./modulesRoutes');
const permissionRoutes = require('./permissionRoutes');

const userRoutes = require('./userRoutes');


const logger = require('../logger');

router.get('/', (req, res) => {
  const data = {
    message: 'This is a sample JSON response from API.',
    timestamp: new Date().toISOString(), 
    desc: 'this is a test '
  };
  res.send(data);
});

router.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate(); 
    res.status(200).json({ message: 'Database connected' });
  } catch (error) {
    res.status(503).json({ message: 'Database connection failed', error: error.message });
  }
});

router.use('/api/v1', v1Routes);

router.use('/api/auth', authRoutes);


router.use('/api/roles', verifyAndRefreshToken, roleRoutes);
router.use('/api/permissions', verifyAndRefreshToken, permissionRoutes);

router.post('/api/users/add', createUserValidationRules(), validate, usersController.createUser);

router.use('/api/modules', verifyAndRefreshToken, modulesRoutes);
router.use('/api/users', verifyAndRefreshToken, userRoutes);

module.exports = router;
