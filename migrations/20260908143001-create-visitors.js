'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('visitors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      visitor_uuid: {
        type: Sequelize.STRING(36),
        allowNull: false,
        unique: true
      },
      first_seen_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      last_seen_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
    await queryInterface.addIndex('visitors', ['visitor_uuid'], {
      unique: true,
      name: 'idx_visitors_visitor_uuid'
    });
    await queryInterface.addIndex('visitors', ['last_seen_at'], {
      name: 'idx_visitors_last_seen_at'
    });
    await queryInterface.addIndex('visitors', ['created_at'], {
      name: 'idx_visitors_created_at'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('visitors');
  }
};
