require('dotenv').config();
const { handleServerError } = require('./errorHandler');
const { sendResponse } = require('../utils/responseHelper');
const sessionService = require('../services/sessionService');

const createSession = async (req, res) => {
  try {
    const data = await sessionService.createSession(req);
    sendResponse(res, 201, true, 'Session created successfully', data);
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};

const updateSession = async (req, res) => {
  try {
    const data = await sessionService.updateSession(req);
    sendResponse(res, 200, true, 'Session updated successfully', data);
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};

module.exports = {
  createSession,
  updateSession
};
