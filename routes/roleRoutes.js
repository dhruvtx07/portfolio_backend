const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const {
  createRoleValidationRules,
  updateRoleValidationRules,
  assignOrUnassignRoleToUserValidationRules,
  switchRoleValidationRules,
  validate
} = require('../validators/roleValidators');

router.post('/', roleController.getAllRoles);
router.get('/:id', roleController.getRoleById);
router.post('/add', createRoleValidationRules(), validate, roleController.createRole);
router.put('/update/:id', updateRoleValidationRules(), validate, roleController.updateRole);
router.delete('/delete/:id', roleController.deleteRole);
router.post('/assign-role', assignOrUnassignRoleToUserValidationRules(), validate, roleController.assignRoleToUser);
router.post('/unassign-role', assignOrUnassignRoleToUserValidationRules(), validate, roleController.unAssignRoleToUser);
router.put('/switch-role', switchRoleValidationRules(), validate, roleController.switchRole);
router.post('/getrolesforadmin', roleController.getRolesForAdmin);

module.exports = router;
