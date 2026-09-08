const { User, Role, UserDashboardRoles, Module, RoleModules, UserAccess, Store, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const { handleServerError } = require('./errorHandler');
const { assignRoleToUser } = require('./roleController');

const { createUserValidationRules, updateUserValidationRules, validate } = require('../validators/userValidators');
const VisitorDetailsService = require('../services/visitorDetailsService');

const { sendResponse } = require('../utils/responseHelper');
const userService = require('../services/userService');
const emailTemplateService = require('../services/emailTemplateService');




/*const getClientIp = (req) => {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    const ipAddresses = xForwardedFor.split(',').map(ip => ip.trim());
    return ipAddresses[0];
  }
  return req.ip;
};*/

const handleNotFound = (res, message) => {
  return res.status(404).json({ success: false, error: { code: 404, message: message } });
};

/*const handleInternalServerError = (res, error) => {
  console.error(error.stack);

  if (error.name === 'SequelizeUniqueConstraintError') {
    const fieldNames = error.errors.map(err => err.path).join(', ');
    res.status(400).json({
      success: false,
      error: {
        message: `${fieldNames} must be unique`,
        error_stack: error.stack
      }
    });
  } else {
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        error_stack: error.stack
      }
    });
  }
};*/

const changePassword = async (req, res) => {
  const { first_name, last_name, current_password, new_password } = req.body;
  //console.log(first_name, last_name, current_password, new_password);

  const token = req.header('Authorization')?.split(' ')[1];
  const secretKey = process.env.JWT_SECRETKEY;

  if (!token || !secretKey) {
    return res.status(401).json({ message: 'Token or secret key is missing' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const user_own_id = decoded.user_id;

    if (!first_name || !last_name) {
      return res.status(400).json({
        message: 'Please provide first name and last name.',
      });
    }

    // Find the authenticated user using the ID from the token
    const user = await User.findByPk(user_own_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // If current_password and new_password are provided, validate and update the password
    if (current_password && new_password) {
      // Compare the current password with the hashed password in the database
      const isMatch = await bcrypt.compare(current_password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      }

      // Hash the new password using bcrypt
      const hashedPassword = await bcrypt.hash(new_password, 10);

      // Update the user's password
      user.password = hashedPassword;
    }

    // Update the user's first name and last name
    user.first_name = first_name;
    user.last_name = last_name;

    // Save the updated user record
    await user.save();

    const responseMessage = current_password && new_password
      ? 'Password changed and details updated successfully.'
      : 'Details updated successfully.';

    res.status(200).json({
      data: { success: true, message: responseMessage },
    });
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};

const editProfile = async (req, res) => {
  const { first_name, last_name } = req.body;

  const token = req.header('Authorization')?.split(' ')[1];
  const secretKey = process.env.JWT_SECRETKEY;

  if (!token || !secretKey) {
    return res.status(401).json({ message: 'Token or secret key is missing' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const user_own_id = decoded.user_id;

    // Ensure all fields are provided
    if (!first_name || !last_name ) {
      return res.status(400).json({
        message: 'Please provide first name, last name.',
      });
    }

    // Find the authenticated user using the ID from the token
    const user = await User.findByPk(user_own_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update the user's details (first name, last name, and password)
    user.first_name = first_name;
    user.last_name = last_name;
    
    // Save the updated user record
    await user.save();

    res.status(200).json({
      data: { success: true, message: 'Profile updated successfully.' },
    });
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }, // Exclude the password field
      include: [
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'role_name'],
          required: true, // Ensures that users must have at least one role in the included roles (3, 4, 5)
          through: {
            attributes: [], // Exclude the `UserDashboardRoles` attributes if not needed
          },
          where: {
            id: { [Op.in]: [3, 4, 5, 7, 8, 9] }, // Only include roles with id 3, 4, and 5
          },
        },
      ],
    });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    //handleInternalServerError(res, error);
  }
};

const getUserById = async (req, res) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    const secretKey = process.env.JWT_SECRETKEY;
    if (!token || !secretKey) {
      throw new Error('Token or secret key is missing');
    }
    const decoded = jwt.verify(token, secretKey);
    const user_own_id = decoded.user_id;

    const userId = req.params.id != 0 ? req.params.id : user_own_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required, but none was provided.',
      });
    }

    // Fetch the user from the database.
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'role_name'],
        },{
          model: Store,
          as: 'stores',
          attributes: [],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Respond with the user details.
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    handleServerError(req, res, error);
  }
};

const getUserByRoleId = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['id', 'role_name'],
        where: { id: req.params.role_id } // Filter users by role_id
      }]
    });

    if (!users || users.length === 0) {
      return handleNotFound(res, 'No users found for the specified role');
    }

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    //handleInternalServerError(res, error);
  }
};

const createUser = async (req, res) => {
  //const transaction = await sequelize.transaction(); // Start a transaction
  try {

    const token = req.header('Authorization')?.split(' ')[1];
    const secretKey = process.env.JWT_SECRETKEY;
/*
    if (!token || !secretKey) {
      throw new Error('Token or secret key is missing');
    }
*/
    let decoded;
    if(token){
      const decoded = jwt.verify(token, secretKey);
    }
    

    const user_admin_id = decoded? decoded.user_id : null;

    const { first_name, last_name, email, password, address, role_id, store_name} = req.body;

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profilePictureUrl = null;
    if (req.file) {
      profilePictureUrl = `/uploads/profile_pictures/${req.file.filename}`;
    }

    // Create the user
    const createdUser = await User.create(
      {
        first_name,
        last_name,
        email,
        password: hashedPassword,
        address,
        profile_picture_url: profilePictureUrl,
        user_admin_id,
      },
      //{ transaction } // Use the transaction
    );

    // Prepare the request and response objects for assignRoleToUser
    const roleAssignmentReq = {
      body: {
        user_id: createdUser.id,
        role_id,
      },
    };
    // Custom response handler for role assignment
    const roleAssignmentRes = {
      status: (code) => ({
        json: (data) => {
          if (!data.success) {
            throw new Error(data.message);
          }
        },
      }),
    };

    await assignRoleToUser(roleAssignmentReq, roleAssignmentRes);

    // Fetch the role object
    const role = await Role.findOne({
      where: { id: role_id },
      attributes: ['id', 'role_name'], // Select only the required fields
    });

    if (!role) {
      throw new Error('Assigned role not found');
    }
    req.body.user_storeowner_id = createdUser.id;
    const { store } = await storeService.createStore(req);

    if (!store) {
      throw new Error('store not created');
    }
    // Commit the transaction if everything is successful
    ////await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'User created and role assigned successfully',
      data: {
        ...createdUser.toJSON(),
        password: undefined, // Exclude the password
        roles: [role],
        store, // Include the complete role object
      },
      //  data: { ...createdUser.toJSON(), password: undefined },
    });
  } catch (error) {
    // Rollback the transaction on error
    ////await transaction.rollback();
    handleServerError(req, res, error);
  }
};

const updateUserStatus =  async (req, res) => {
  try {
    const { status: newstatus } = req.body;
    const token = req.header('Authorization')?.split(' ')[1];
    const secretKey = process.env.JWT_SECRETKEY;

    if (!token || !secretKey) {
      throw new Error('Token or secret key is missing');
    }

    const decoded = jwt.verify(token, secretKey);
    const user_admin_id = decoded.user_id;

    // Fetch the user by primary key (ID)
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return handleNotFound(res, 'User not found');
    }
    //user.status = newstatus || user.status;
    user.status = newstatus;
    // Save updated user details
    await user.save();

    // Exclude password from the response
    const { password: _, ...userWithoutPassword } = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'User status is updated successfully',
      data: userWithoutPassword,
    });
  } catch (error) {
    handleServerError(req, res, error);
  }
};

const updateUser = async (req, res) => {
  try {
    const { first_name, last_name, email, address, password } = req.body;
    const token = req.header('Authorization')?.split(' ')[1];
    const secretKey = process.env.JWT_SECRETKEY;

    if (!token || !secretKey) {
      throw new Error('Token or secret key is missing');
    }

    const decoded = jwt.verify(token, secretKey);
    const user_admin_id = decoded.user_id;

    // Fetch the user by primary key (ID)
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return handleNotFound(res, 'User not found');
    }

    // Update password only if provided
    if (password?.trim()) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    // Update profile picture if a new file is uploaded
    if (req.file) {
      const profilePictureUrl = `/uploads/profile_pictures/${req.file.filename}`;
      user.profile_picture_url = profilePictureUrl;
    }

    // Update other fields, falling back to existing values if not provided
    user.first_name = first_name || user.first_name;
    user.last_name = last_name || user.last_name;
    user.email = email || user.email;
    user.user_admin_id = user_admin_id || user.user_admin_id;
    user.address = address || user.address;

    // Save updated user details
    await user.save();

    // Exclude password from the response
    const { password: _, ...userWithoutPassword } = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userWithoutPassword,
    });
  } catch (error) {
    handleServerError(req, res, error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { user_id, role_id } = req.body;
    console.log("role_id ===== "); console.log(role_id);
    console.log("user_id ===== "); console.log(user_id);
    
    const user = await User.findByPk(user_id);
    if (!user) {
      return handleNotFound(res, 'User not found');
    }

    // Delete the first role association
    await UserDashboardRoles.destroy({ where: { user_id: user_id, role_id: role_id } });
    // Delete the user
    await user.destroy();

    return res.status(200).json({
      success: true,
      message: 'User and their role association deleted successfully',
    });
  } catch (error) {
    handleServerError(req, res, error);
  }
};

const userDetails = async (req, res, logSwitchRole = true) => {
  const { user_id, role_id } = req.body;

  try {
    // Fetch the user along with roles and associated modules based on permissions
  const user = await User.findByPk(user_id, {
    attributes: { exclude: ['password'] }, // Exclude sensitive fields
    include: [
      {
        model: Role, // Association between User and Role
        as: 'roles',
        attributes: ['id', 'role_name'], // Select role details
        through: { attributes: [] }, // Exclude join table attributes
        include: [
          {
            model: Module, // Association between Role and Module via modules_permissions
            as: 'modulesViaPermissions',
            attributes: ['id', 'title', 'url'], // Select module details
            through: {
              attributes: ['add', 'update', 'delete', 'view'], // Include permissions from modules_permissions
              //where: { view: true }, // Only include modules where `view` permission is true
              
              /*
                the above where clause is removed to allow frontend App.tsx -> hasAccessToModule
                check based on the modules_permissions:view and not on modules existance.
              */

            }
          }
        ]
      },...(parseInt(role_id) !== 1 ? [{
          model: Store,
          as: 'stores',
          where: { user_storeowner_id: user_id },
          required: false,
        }] : [])
      ]
});

let stores = user?.stores ?? [];
if (parseInt(role_id) === 1) {
  stores = await Store.findAll({
    include: [{ model: User, as: 'store_owner', attributes: ['first_name', 'last_name', 'email', 'status'] }]
  });
}
/*
  if (parseInt(role_id) !== 1) {
    const activeStores = stores.filter(store => store.status == 1);
    if (activeStores.length === 0) {
      const response = { success: false, message: 'Your store is inactive.' };
      if (res) return res.status(403).json(response);
      return response;
    }
    stores = activeStores;
  }
*/
    // Check if user exists
    if (!user) {
      const response = { success: false, message: 'User not found' };
      if (res) return res.status(404).json(response);
      return response;
    }


    // Find the current role based on role_id
    const currentRole = user.roles.find(role => role.id === parseInt(role_id, 10));

    // Check if role is assigned to the user
    if (!currentRole) {
      const response = { success: false, message: 'Role is not assigned to the user' };
      if (res) return res.status(400).json(response);
      return response;
    }

    const userJson = user.toJSON();
    const rolesWithoutModules = userJson.roles.map(role => {
      const { modulesViaPermissions, ...roleWithoutModules } = role;
      return roleWithoutModules;
    });
    
    // Prepare user data for response
    const userData = {
      ...user.toJSON(),
      roles: rolesWithoutModules,
      current_role: currentRole.id,
      modules: currentRole.modulesViaPermissions,
      stores,
    };

    // Log user access for role switch only if logSwitchRole is true
    if (logSwitchRole && role_id) {
      const clientIp = req.ip;
      const userAgent = req.headers['user-agent'];
      const visitorDetailsService = new VisitorDetailsService();
      await visitorDetailsService.insertRow({
        user_id: user_id,
        role_id: role_id,
        ip: clientIp,
        useragent: userAgent,
        type: 'switch_role',
      });
    }

    // Return success response with user data
    const response = { success: true, data: userData };
    if (res) return res.json(response);
    return response;
  } catch (error) {
    const response = { success: false, error: { message: 'Server Error', error: error.message, error_stack: error.stack } };
    if (res) return res.status(500).json(response);
    return response;
  }
};



const forgotPassword = async (req, res) => {
  try {
    const { message } = await userService.forgotPassword(req);
    sendResponse(res, 200, true, message);
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { message } = await userService.resetPassword(req);
    sendResponse(res, 200, true, message);
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};


module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  userDetails,
  getUserByRoleId,
  changePassword,
  editProfile,
  updateUserStatus,
  forgotPassword,
  resetPassword
};
