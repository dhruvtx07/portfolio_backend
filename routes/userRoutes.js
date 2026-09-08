const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { updateUserValidationRules, createUserValidationRules, changePasswordValidationRules, validate } = require('../validators/userValidators');

router.get('/', usersController.getAllUsers);
router.get('/:id?', usersController.getUserById);
// router.post('/add', upload, createUserValidationRules(), validate, usersController.createUser);
router.put('/updatestatus/:id', usersController.updateUserStatus);
router.post('/delete', usersController.deleteUser);
router.post('/getuserdetails', usersController.userDetails);
router.post('/change-password', changePasswordValidationRules(), validate, usersController.changePassword);
router.post('/edit-profile', usersController.editProfile);

module.exports = router;