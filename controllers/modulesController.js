const { Module, ModulesPermissions } = require('../models');

const { handleServerError } = require('./errorHandler');

const getAllModules = async (req, res) => {
  try {
    const modules = await Module.findAll();
    res.status(200).json({
      success: true,
      message: 'Modules retrieved',
      data: modules
    });
  } catch (error) {
    handleServerError(req, res, error);
  }
};

const getModuleById = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.id);
    if (!module) {
      return res.status(404).json({
        success: false,
        error: { message: 'Module not found' }
      });
    }
    res.status(200).json({
      success: true,
      message: 'Module retrieved',
      data: module
    });
  } catch (error) {
    handleServerError(req, res, error);
  }
};

const createModule = async (req, res) => {
  try {
    const { title, url } = req.body;
    const newModule = await Module.create({ title, url });
    //super admin having role_id=1 is authorised to access all modules.
    const newPermission = await ModulesPermissions.create({ role_id: "1", module_id: newModule.id, add:"1", update:"1", delete:"1", view: "1" });
  
    res.status(200).json({
      success: true,
      message: 'Module created',
      data: newModule
    });
  } catch (error) {
    handleServerError(req, res, error);
  }
};

const updateModule = async (req, res) => {
  try {
    const { title, url } = req.body;
    const module = await Module.findByPk(req.params.id);
    if (!module) {
      return res.status(404).json({
        success: false,
        error: { message: 'Module not found' }
      });
    }
    module.title = title || module.title;
    module.url = url || module.url;
    await module.save();
    res.status(200).json({
      success: true,
      message: 'Module updated',
      data: module
    });
  } catch (error) {
    handleServerError(req, res, error);
  }
};

const deleteModule = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.id);
    if (!module) {
      return res.status(404).json({
        success: false,
        error: { message: 'Module not found' }
      });
    }
    await module.destroy();
    res.status(200).json({
      success: true,
      message: 'Module deleted'
    });
  } catch (error) {
    handleServerError(req, res, error);
  }
};

module.exports = {
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule
};
