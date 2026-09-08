'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    static associate(models) {
      Session.belongsTo(models.Visitor, {
        foreignKey: 'visitor_id',
        as: 'visitor'
      });
      Session.hasMany(models.Event, {
        foreignKey: 'session_id',
        as: 'events',
        onDelete: 'CASCADE'
      });
    }
  }

  Session.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    session_uuid: {
      type: DataTypes.STRING(36),
      allowNull: false,
      unique: true
    },
    visitor_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'visitors',
        key: 'id'
      }
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    ended_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_activity_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    landing_page: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    last_page: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    referrer: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    device_type: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    browser: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    os: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Session',
    tableName: 'sessions',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Session;
};
