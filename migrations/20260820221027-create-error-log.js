'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('error_logs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      error_code: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      error_stack: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      ip_address: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      ip_location: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      request_path: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      device: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('error_logs');
  },
};
