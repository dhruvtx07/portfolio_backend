'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserDashboardRoles extends Model {
    static associate(models) {
      // Define associations here
    }
  }

  UserDashboardRoles.init({
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    role_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Roles',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'UserDashboardRoles',
    tableName: 'user_dashboard_roles'
  });

  return UserDashboardRoles;
};
