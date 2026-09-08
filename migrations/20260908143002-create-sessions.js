'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sessions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      session_uuid: {
        type: Sequelize.STRING(36),
        allowNull: false,
        unique: true
      },
      visitor_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'visitors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      started_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      ended_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      last_activity_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      landing_page: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      last_page: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      referrer: {
        type: Sequelize.STRING(1000),
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      device_type: {
        type: Sequelize.STRING(30),
        allowNull: true
      },
      browser: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      os: {
        type: Sequelize.STRING(50),
        allowNull: true
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
    await queryInterface.addIndex('sessions', ['session_uuid'], {
      unique: true,
      name: 'idx_sessions_session_uuid'
    });
    await queryInterface.addIndex('sessions', ['visitor_id'], {
      name: 'idx_sessions_visitor_id'
    });
    await queryInterface.addIndex('sessions', ['visitor_id', 'started_at'], {
      name: 'idx_sessions_visitor_started'
    });
    await queryInterface.addIndex('sessions', ['started_at'], {
      name: 'idx_sessions_started_at'
    });
    await queryInterface.addIndex('sessions', ['last_activity_at'], {
      name: 'idx_sessions_last_activity_at'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sessions');
  }
};
