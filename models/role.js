'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      if (models.User && models.UserDashboardRoles) {
        Role.belongsToMany(models.User, {
          through: models.UserDashboardRoles,
          foreignKey: 'role_id',
          as: 'users'
        });
      }
    }
  }

  Role.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    role_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    timestamps: true
  });

  return Role;
};
