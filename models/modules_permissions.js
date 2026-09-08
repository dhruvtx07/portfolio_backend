'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ModulesPermissions extends Model {
    static associate(models) {
      ModulesPermissions.belongsTo(models.Role, {
        foreignKey: 'role_id',
        as: 'role'
      });

      ModulesPermissions.belongsTo(models.Module, {
        foreignKey: 'module_id',
        as: 'module'
      });
    }
  }

  ModulesPermissions.init({
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Roles',
        key: 'id'
      }
    },
    module_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Modules',
        key: 'id'
      }
    },
    //add: DataTypes.BOOLEAN,
    addField: { // Rename the attribute to avoid conflicts
      type: DataTypes.BOOLEAN,
      field: 'add', // Map it to the database column named 'update'
    },
    updateField: { // Rename the attribute to avoid conflicts
      type: DataTypes.BOOLEAN,
      field: 'update', // Map it to the database column named 'update'
    },
    deleteField: { // Rename the attribute for the same reason
      type: DataTypes.BOOLEAN,
      field: 'delete', // Map it to the database column named 'delete'
    },
    //view: DataTypes.BOOLEAN
    viewField: { // Rename the attribute to avoid conflicts
      type: DataTypes.BOOLEAN,
      field: 'view', // Map it to the database column named 'update'
    },
    
  }, {
    sequelize,
    modelName: 'ModulesPermissions',
    tableName: 'modules_permissions',
    freezeTableName: true
  });

  return ModulesPermissions;
};
