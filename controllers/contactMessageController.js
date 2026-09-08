require('dotenv').config();
const { handleServerError } = require('./errorHandler');
const { sendResponse } = require('../utils/responseHelper');
const contactMessageService = require('../services/contactMessageService');

const createContactMessage = async (req, res) => {
  try {
    const data = await contactMessageService.createContactMessage(req);
    sendResponse(res, 201, true, 'Contact message submitted successfully', data);
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};

module.exports = {
  createContactMessage
};
