const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const {
  createPermissionValidationRules,
  updatePermissionValidationRules,
  validate
} = require('../validators/permissionValidators');

router.get('/', permissionController.getAllPermissions);
router.get('/:id', permissionController.getPermissionById);
router.post('/add', createPermissionValidationRules(), validate, permissionController.createPermission);
router.put('/update/:id', updatePermissionValidationRules(), validate, permissionController.updatePermission);
router.delete('/delete/:id', permissionController.deletePermission);

module.exports = router;
