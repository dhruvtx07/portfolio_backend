require('dotenv').config();
const { handleServerError } = require('./errorHandler');
const { sendResponse } = require('../utils/responseHelper');
const authService = require('../services/authService');

const login = async (req, res) => {
  try {
    const data = await authService.login(req);
    sendResponse(res, 200, true, 'Login successful', data);
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};

module.exports = {
  login
};
