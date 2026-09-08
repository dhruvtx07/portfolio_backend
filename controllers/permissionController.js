const { ModulesPermissions, Role, Module, Sequelize } = require('../models');
const { handleServerError } = require('./errorHandler');
const { getUserAdminIdFromToken } = require('../utils/authUtils');

const includeModels = [
  { model: Role, as: 'role', attributes: ['id', 'role_name'] },
  { model: Module, as: 'module', attributes: ['id', 'title', 'url'] }
];

const getAllPermissions = async (req, res) => {
  try {
    const permissions = await ModulesPermissions.findAll({ include: includeModels });
    res.status(200).json({ success: true, message: 'Permissions', data: permissions });
  } catch (error) {
    handleServerError(req, res, error);
  }
};

const getPermissionById = async (req, res) => {
  try {
    const permission = await ModulesPermissions.findByPk(req.params.id, { include: includeModels });
    if (!permission) {
      return res.status(404).json({ success: false, error: { code: 404, message: 'Permission not found' } });
    }
    res.status(200).json({ success: true, message: 'Permission found', data: permission });
  } catch (error) {
    handleServerError(req, res, error);
  }
};

const createPermission = async (req, res) => {
  try {
    const { role_id, module_id, add, update, delete: deletePermission, view } = req.body;
    const [role, module] = await Promise.all([Role.findByPk(role_id), Module.findByPk(module_id)]);

    if (!role || !module) {
      return res.status(400).json({ success: false, error: { code: 400, message: 'Invalid role_id or module_id' } });
    }

    const existingPermission = await ModulesPermissions.findOne({ where: { role_id, module_id } });
    if (existingPermission) {
      return res.status(400).json({ success: false, error: { code: 400, message: 'Permission with this role and module already exists' } });
    }

    const user_admin_id = getUserAdminIdFromToken(req);

    const newPermission = await ModulesPermissions.create({ role_id, module_id, add, update, delete: deletePermission, view, user_admin_id });
    res.status(200).json({ success: true, message: 'Permission created', data: newPermission });
  } catch (error) {
    handleServerError(req, res, error);
  }
};

const updatePermission = async (req, res) => {
  try {
    const { role_id, module_id, add, update, delete: deletePermission, view } = req.body;
    const user_admin_id = getUserAdminIdFromToken(req);

    const permission = await ModulesPermissions.findByPk(req.params.id);

    if (!permission) {
      return res.status(404).json({ success: false, error: { code: 404, message: 'Permission not found' } });
    }

    // Validate role_id and module_id
    if (role_id !== undefined) {
      const role = await Role.findByPk(role_id);
      if (!role) {
        return res.status(400).json({ success: false, error: { code: 400, message: 'Invalid role_id' } });
      }
    }

    if (module_id !== undefined) {
      const module = await Module.findByPk(module_id);
      if (!module) {
        return res.status(400).json({ success: false, error: { code: 400, message: 'Invalid module_id' } });
      }
    }

    // Check for existing permission with the same role_id and module_id
    const existingPermission = await ModulesPermissions.findOne({ 
      where: { 
        role_id: role_id !== undefined ? role_id : permission.role_id, 
        module_id: module_id !== undefined ? module_id : permission.module_id 
      } 
    });

    if (existingPermission && existingPermission.id !== permission.id) {
      return res.status(400).json({ success: false, error: { code: 400, message: 'Permission with this role and module already exists' } });
    }

    // Delete the old permission if role_id or module_id are being updated
    if (role_id !== undefined || module_id !== undefined) {
      await permission.destroy();
    }

    const newPermission = await ModulesPermissions.create({
      role_id: role_id !== undefined ? parseInt(role_id, 10) : permission.role_id,
      module_id: module_id !== undefined ? parseInt(module_id, 10) : permission.module_id,
      add: add !== undefined ? add : permission.add,
      updateField: update !== undefined ? update : permission.updateField, // Use the renamed attribute
      deleteField: deletePermission !== undefined ? deletePermission : permission.deleteField, // Use the renamed attribute
      view: view !== undefined ? view : permission.view,
      user_admin_id: user_admin_id,
    });
    
    res.status(200).json({ success: true, message: 'Permission updated...', data: newPermission });
  } catch (error) {
    console.error('Error updating permission:', error);
    handleServerError(req, res, error);
  }
};

const deletePermission = async (req, res) => {
  try {
    const permission = await ModulesPermissions.findOne({
      where: { id: req.params.id }  
    });
    if (!permission) {
      return res.status(404).json({ success: false, error: { code: 404, message: 'Permission not found' } });
    }
    await permission.destroy();
    res.status(200).json({ success: true, message: 'Permission deleted' });
  } catch (error) {
    handleServerError(req, res, error);
  }
};

module.exports = {
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission
};
