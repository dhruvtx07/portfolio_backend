const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const Sequelize = require('sequelize');
const routes = require('./routes/routes');
const logger = require('./logger');
const { sendErrorEmail } = require('./utils/emailUtils');

const { handleServerError } = require('./controllers/errorHandler');

const fs = require('fs');
const nodemailer = require('nodemailer');

console.log("process.env.NODE_ENV   -------> ");console.log(process.env.NODE_ENV);
let logFile;

logFile = fs.createWriteStream(process.env.LOG_FILE_PATH, { flags: 'a' });
const logStdout = process.stdout;

console.log = function (...args) {
  const output = args.map(arg =>
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
  ).join(' ');

  logFile.write(new Date().toISOString() + ' - ' + output + '\n');
  logStdout.write(new Date().toISOString() + ' - ' + output + '\n');
};

console.error = console.log; // Redirect console.error as well

// Set environment variables
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

const envFile =
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: envFile });
const env = process.env.NODE_ENV || 'development';

const app = express();

// Fetch allowed CORS URLs from environment
const allowedCorsUrls = (process.env.CORS_ALLOWED_URLS || '').split(',');

// CORS configuration
/*const corsOptions = {
  origin: allowedCorsUrls.length > 0 ? allowedCorsUrls : [/^http:\/\/localhost:\d+$/],
  methods: ['*'], // Allows all methods
  allowedHeaders: 'Content-Type,Authorization',
};*/
const corsOptions = {
  origin: [
    ...allowedCorsUrls,
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    /^http:\/\/localhost:\d+$/,
  ],
  methods: ['*'],
  allowedHeaders: 'Content-Type,Authorization',
};

app.use(cors(corsOptions));

const path = require('path');
app.use('/storage/uploads', express.static(path.join(process.cwd(), 'storage/uploads')));

// Middleware to parse different types of request bodies. verify saves the raw buffer so Shopify webhook HMAC verification works
app.use(bodyParser.json({
  verify: (req, res, buf) => { req.rawBody = buf; }
}));
app.use(bodyParser.urlencoded({ extended: true }));

// Mount routes
app.use('/', routes);

// Sequelize configuration
const config = require('./config/config.js')[env];
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: false, // Disable logging
  }
);

// Test the database connection
sequelize
  .authenticate()
  .then(() => {
    console.log(
      'Connection to the database has been established successfully.'
    );
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
    sendErrorEmail('NS: Database Connection Error app.js ERROR!!', err);
  });

process.on('uncaughtException', async (err) => {
  console.log('Uncaught Exception -- Type of err:', typeof err);
  console.log('Err itself:', err);
  if (err instanceof Error) console.log(err.stack);

  const fakeReq = { headers: { 'user-agent': '', authorization: '' }, header: () => '', originalUrl: '', url: '' };
  const fakeRes = { headersSent: true, status: () => fakeRes, json: () => {}, send: () => {} };
  await handleServerError(fakeReq, fakeRes, err, false);

  await sendErrorEmail('Portfolio Backend: Uncaught Exception app.js ERROR!!', err);
  process.exit(1);
});

process.on('unhandledRejection', async (err) => {
  console.log('Unhandled Rejection -- Type of err:', typeof err);
  console.log('Err itself:', err);
  if (err instanceof Error) console.log(err.stack);
  
  const fakeReq = { headers: { 'user-agent': '', authorization: '' }, header: () => '', originalUrl: '', url: '' };
  const fakeRes = { headersSent: true, status: () => fakeRes, json: () => {}, send: () => {} };
  await handleServerError(fakeReq, fakeRes, err, false);

  await sendErrorEmail('Portfolio Backend: Unhandled Rejection app.js ERROR!!', err);
  process.exit(1);
});


app.use((err, req, res, next) => {
  logger.error('Error occurred:', err);
  logger.error(err.stack);
  console.error('Error Details:', err);

  const statusCode = err.statusCode || 500;

  const errorResponse = {
    success: false,
    message: err.message || 'Internal Server Error. app',
    details: 'Something broke...',
  };

  res.status(statusCode).json(errorResponse);
});

// Export the app for testing
module.exports = app;

// Conditionally start the server if not in a test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3033;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    logger.info('Application has started.');
    console.log('Node.js application started.');
  });

}