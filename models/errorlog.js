'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ErrorLog extends Model {}

  ErrorLog.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    error_code: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    error_stack: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    ip_location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    request_path: {
      type: DataTypes.STRING,
      allowNull: true
    },
    device: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ErrorLog',
    tableName: 'error_logs',
    timestamps: true
  });

  return ErrorLog;
};
