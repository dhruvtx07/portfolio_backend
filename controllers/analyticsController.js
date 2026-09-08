require('dotenv').config();
const { handleServerError } = require('./errorHandler');
const { sendResponse } = require('../utils/responseHelper');
const analyticsService = require('../services/analyticsService');

const getOverview = async (req, res) => {
  try {
    const data = await analyticsService.getOverview(req);
    sendResponse(res, 200, true, 'Overview metrics fetched successfully', data);
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};

const getPages = async (req, res) => {
  try {
    const data = await analyticsService.getPages(req);
    sendResponse(res, 200, true, 'Page analytics fetched successfully', data);
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};

const getEvents = async (req, res) => {
  try {
    const data = await analyticsService.getEvents(req);
    sendResponse(res, 200, true, 'Event analytics fetched successfully', data);
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};

const getDevices = async (req, res) => {
  try {
    const data = await analyticsService.getDevices(req);
    sendResponse(res, 200, true, 'Device analytics fetched successfully', data);
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};

const getReferrers = async (req, res) => {
  try {
    const data = await analyticsService.getReferrers(req);
    sendResponse(res, 200, true, 'Referrer analytics fetched successfully', data);
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};

module.exports = {
  getOverview,
  getPages,
  getEvents,
  getDevices,
  getReferrers
};
