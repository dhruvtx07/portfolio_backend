'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create the table
    await queryInterface.createTable('settings', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      key_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      data_type: {
        type: Sequelize.ENUM('string', 'number', 'boolean', 'json'),
        defaultValue: 'string',
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

  },

  down: async (queryInterface, Sequelize) => {
    // Drop the table
    await queryInterface.dropTable('settings');
  },
};
