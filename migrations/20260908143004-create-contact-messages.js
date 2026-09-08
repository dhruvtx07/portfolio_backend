'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contact_messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'unread'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Indexes
    await queryInterface.addIndex('contact_messages', ['status'], {
      name: 'idx_contact_messages_status'
    });
    await queryInterface.addIndex('contact_messages', ['email'], {
      name: 'idx_contact_messages_email'
    });
    await queryInterface.addIndex('contact_messages', ['created_at'], {
      name: 'idx_contact_messages_created_at'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contact_messages');
  }
};
