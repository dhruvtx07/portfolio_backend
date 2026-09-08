'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const dotenv = require('dotenv'); // Add this line

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const db = {};

// Load environment variables from .env file
dotenv.config(); // Add this line

let sequelize;

if (process.env.DATABASE_URL) { // Use your environment variable for the database URL
  sequelize = new Sequelize(process.env.DATABASE_URL); // Use your environment variable for the database URL
} else {
  sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    pool: {
      max: 10, // Maximum number of connections in the pool
      min: 0, // Minimum number of connections in the pool
      acquire: 30000, // Maximum time (in milliseconds) that a connection can be idle before being released
      idle: 10000 // Maximum time (in milliseconds) that a connection can be idle before being released
    },
    logging: false
  });
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
