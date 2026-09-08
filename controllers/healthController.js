require('dotenv').config();
const { handleServerError } = require('./errorHandler');
const { sendResponse } = require('../utils/responseHelper');

const getHealth = async (req, res) => {
  try {
    sendResponse(res, 200, true, 'API is healthy', {
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};

module.exports = {
  getHealth
};
