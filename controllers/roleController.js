const { Role, User, ModulesPermissions, UserDashboardRoles,Module, sequelize } = require('../models');
const { Op } = require('sequelize');
const { handleServerError } = require('./errorHandler');

const includeUsers = {
  model: User,
  as: 'users',
  attributes: ['id', 'first_name', 'last_name', 'email'],
  through: { model: UserDashboardRoles, attributes: [] }
};

const includeModules = {
  model: ModulesPermissions,
  as: 'modulesPermissions',
  attributes: ['id', 'module_id', 'add', 'update', 'delete', 'view']
};

const getRolesForAdmin = async (req, res) => {
  try {
    const roles = await Role.findAll({
      where: {
        id: { [Op.notIn]: [1, 2, 6] } // Exclude roles with id 1 and 2
      },
      attributes: ['id', 'role_name'] // Include only necessary attributes
    });
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    handleInternalServerError(res, error);
  }
};

const getAllRoles = async (req, res) => {
  const { list } = req.body;

  try {
    let roles;

    switch (list) {
      case 'listroles':
        roles = await Role.findAll({
          attributes: ['id', 'role_name']
        });
        break;
      case 'listrolesusersmodules':
        roles = await Role.findAll({
          attributes: [
            'id',
            'role_name',
            [sequelize.fn('COUNT', sequelize.col('users.id')), 'userCount']
          ],
          include: [
            {
              model: User,
              as: 'users', // Ensure this alias matches the association
              attributes: []
            },
            {
              model: Module,
              as: 'modulesViaPermissions', // Ensure this alias matches the association
              attributes: ['id', 'title'],
              through: { attributes: [] }
            }
          ],
          group: ['Role.id','users.id', 'modulesViaPermissions.id', 'modulesViaPermissions.title']
        });
        break;
      default:
        return res.status(400).json({ success: false, error: { code: 400, message: 'Invalid list parameter value' } });
    }

    res.status(200).json({ success: true, message: 'Roles', data: roles });
  } catch (error) {
    handleServerError(req, res, error);
  }
};

const getRoleById = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id, {
      include: [includeUsers, includeModules]
    });
    if (!role) {
      return res.status(404).json({ success: false, error: { code: 404, message: 'Role not found' } });
    }
    res.status(200).json({ success: true, message: 'Role found', data: role });
  } catch (error) {
    handleServerError(req, res, error);
  }
};

const createRole = async (req, res) => {
  try {
    const { role_name } = req.body;
    const existingRole = await Role.findOne({ where: { role_name } });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: 'Role name already exists'
        }
      });
    }
    const newRole = await Role.create({ role_name });
    res.status(200).json({ success: true, message: 'Role Created', data: newRole });
  } catch (error) {
    handleServerError(req, res, error);
  }
};

const updateRole = async (req, res) => {
  try {
    const { role_name } = req.body;
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, error: { code: 404, message: 'Role not found' } });
    }
    role.role_name = role_name || role.role_name;
    await role.save();
    res.status(200).json({ success: true, message: 'Role Updated', data: role });
  } catch (error) {
    handleServerError(req, res, error);
  }
};

const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, error: { code: 404, message: 'Role not found' } });
    }

    const userRoleCount = await UserDashboardRoles.count({ where: { role_id: req.params.id } });
    if (userRoleCount > 0) {
      return res.status(400).json({ success: false, error: { code: 400, message: 'Role is assigned to one or more users and cannot be deleted' } });
    }

    await role.destroy();
    res.status(200).json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    handleServerError(req, res, error);
  }
};

const assignRoleToUser = async (req, res) => {
  try {
    const { user_id, role_id } = req.body;

    const user = await User.findByPk(user_id);
    const role = await Role.findByPk(role_id);
    //console.log("TESTING.....");console.log(user_id);console.log(role_id);
    if (!user || !role) {
      return res.status(404).json({ success: false, error: { code: 404, message: 'User or Role not found' } });
    }

    const existingUserRole = await UserDashboardRoles.findOne({ where: { user_id, role_id } });
    if (existingUserRole) {
      return res.status(400).json({ success: false, error: { code: 400, message: 'This role is already assigned to the user' } });
    }

    const userRole = await UserDashboardRoles.create({ user_id, role_id });
    res.status(200).json({
      success: true,
      message: 'Role assigned successfully',
      data: role, // Return the full role object
    });
    //
    res.status(200).json({ success: true, data: { user_id: userRole.user_id, role_id: userRole.role_id } });
  } catch (error) {
    handleServerError(req, res, error);
  }
};

const unAssignRoleToUser = async (req, res) => {
  try {
    const { user_id, role_id } = req.body;

    const user = await User.findByPk(user_id);
    const role = await Role.findByPk(role_id);

    if (!user || !role) {
      return res.status(404).json({ success: false, error: { code: 404, message: 'User or Role not found' } });
    }

    const existingUserRole = await UserDashboardRoles.findOne({ where: { user_id, role_id } });
    if (!existingUserRole) {
      return res.status(400).json({ success: false, error: { code: 400, message: 'No role found with this user' } });
    }

    await existingUserRole.destroy();

    res.status(200).json({ success: true, message: 'Role un-assigned successfully'});
  } catch (error) {
    handleServerError(req, res, error);
  }
};

const switchRole = async (req, res) => {
  try {
    const { user_id, role_id } = req.body;

    const user = await User.findByPk(user_id);
    const role = await Role.findByPk(role_id);

    if (!user || !role) {
      return res.status(404).json({ success: false, error: { code: 404, message: 'User or Role not found' } });
    }

    const userRole = await UserDashboardRoles.findOne({ where: { user_id } });
    
    if (!userRole) {
      return res.status(404).json({ success: false, error: { code: 404, message: 'User does not have an assigned role' } });
    }

    userRole.role_id = role_id;
    await userRole.save();

    res.status(200).json({ success: true, data: userRole });
  } catch (error) {
    handleServerError(req, res, error);
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser,
  switchRole,
  unAssignRoleToUser,
  getRolesForAdmin
};
