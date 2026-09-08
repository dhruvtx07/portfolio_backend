'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Settings extends Model {
    /**
     * Define associations here if needed in the future.
     */
    static associate(models) {
      // Add associations if required
    }
  }

  Settings.init(
    {
      key_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      value: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Settings',
      tableName: 'settings',
      timestamps: false, // Disable automatic timestamps if not needed
    }
  );

  return Settings;
};
