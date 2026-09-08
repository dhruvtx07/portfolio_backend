require('dotenv').config();
const { handleServerError } = require('./errorHandler');
const { sendResponse } = require('../utils/responseHelper');
const storeService = require('../services/storeService');

const createStore = async (req, res) => {
  try {
    const { store } = await storeService.createStore(req);
    sendResponse(res, 200, true, `Store created successfully`, { store });
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};

const getAllStores = async (req, res) => {
  try {
    const { stores, pagination } = await storeService.getAllStores(req);
    sendResponse(res, 200, true, `Stores fetched successfully`, { stores, pagination });
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};

const searchStores = async (req, res) => {
  try {
    const { stores } = await storeService.searchStores(req);
    sendResponse(res, 200, true, `Stores searched successfully`, { stores });
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};

const getStorefrontById = async (req, res) => {
  try {
    const { store, settings} = await storeService.getStorefrontById(req);
    sendResponse(res, 200, true, `Store fetched successfully`, { store, settings });
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};

const updateStore = async (req, res) => {
  try {
    const { store } = await storeService.updateStore(req);
    sendResponse(res, 200, true, `Store updated successfully`, { store });
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};

const toggleStoreStatus = async (req, res) => {
  try {
    const { store, message } = await storeService.toggleStoreStatus(req);
    sendResponse(res, 200, true, message, { store });
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};

const uploadStoreLogo = async (req, res) => {
  try {
    const { id, logo } = await storeService.uploadStoreLogo(req);
    sendResponse(res, 200, true, `Store logo uploaded successfully`, { id, logo });
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};
const calculateCommission = async (req, res) => {
  try {
    const { currentStore, allStores } = await storeService.calculateCommission(req);
    sendResponse(res, 200, true, 'Commission calculated successfully', { currentStore, allStores });
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};
/*
const updateStorePaymentState = async (req, res) => {
  try {
    const { store } = await storeService.updateStorePaymentState(req);
    sendResponse(res, 200, true, `Store Payment State updated successfully`, { id: store.id, payment_state: store.payment_state });
  } catch (error) {
    console.error(error);
    handleServerError(req, res, error);
  }
};
*/
module.exports = {
  createStore,
  getAllStores,
  searchStores,
  getStorefrontById,
  updateStore,
  toggleStoreStatus,
  uploadStoreLogo,
  calculateCommission,
  //updateStorePaymentState,
};