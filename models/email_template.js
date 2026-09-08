'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EmailTemplate extends Model {
    static associate(models) {
    }
  }

  EmailTemplate.init(
    {
      name: DataTypes.STRING,
      subject: DataTypes.STRING,
      type: DataTypes.STRING,
      email_body: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'EmailTemplate',
      tableName: 'email_templates',
    }
  );

  return EmailTemplate;
};