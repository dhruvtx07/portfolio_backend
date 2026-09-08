'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      session_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'sessions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      page: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Indexes
    await queryInterface.addIndex('events', ['session_id'], {
      name: 'idx_events_session_id'
    });
    await queryInterface.addIndex('events', ['type'], {
      name: 'idx_events_type'
    });
    await queryInterface.addIndex('events', ['created_at'], {
      name: 'idx_events_created_at'
    });
    await queryInterface.addIndex('events', ['session_id', 'created_at'], {
      name: 'idx_events_session_created'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('events');
  }
};
