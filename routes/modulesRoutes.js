const express = require('express');
const router = express.Router();
const modulesController = require('../controllers/modulesController');
const {
  createModuleValidationRules,
  updateModuleValidationRules,
  validate
} = require('../validators/moduleValidators');

router.get('/', modulesController.getAllModules);
router.get('/:id', modulesController.getModuleById);
router.post('/add', createModuleValidationRules(), validate, modulesController.createModule);
router.put('/update/:id', updateModuleValidationRules(), validate, modulesController.updateModule);
router.delete('/delete/:id', modulesController.deleteModule);

module.exports = router;
