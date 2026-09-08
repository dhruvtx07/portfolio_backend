require('dotenv').config();
const { handleServerError } = require('./errorHandler');
const { sendResponse } = require('../utils/responseHelper');
const eventService = require('../services/eventService');

const recordEvent = async (req, res) => {
  try {
    const data = await eventService.recordEvent(req);
    sendResponse(res, 201, true, 'Event recorded successfully', data);
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};

module.exports = {
  recordEvent
};
