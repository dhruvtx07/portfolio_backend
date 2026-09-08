// models/Module.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Module extends Model {
    static associate(models) {
      Module.belongsToMany(models.Role, {
        through: models.ModulesPermissions,
        foreignKey: 'module_id',
        otherKey: 'role_id',
        as: 'roles'
      });

      Module.hasMany(models.ModulesPermissions, {
        foreignKey: 'module_id',
        as: 'modulesPermissions'
      });
    }
  }

  Module.init({
    title: DataTypes.STRING,
    url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Module',
    tableName: 'modules',
  });

  return Module;
};
