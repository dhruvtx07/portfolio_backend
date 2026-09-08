const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Sequelize = require('sequelize');

const routes = require('./routes/routes.js');
const logger = require('./utils/logger.js');

// ------------------------------------
// Environment
// ------------------------------------

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
}

const envFile =
    process.env.NODE_ENV === 'production'
        ? '.env.production'
        : '.env';

dotenv.config({ path: envFile });

const env = process.env.NODE_ENV;

// ------------------------------------
// App
// ------------------------------------

const app = express();

// ------------------------------------
// CORS
// ------------------------------------

const allowedCorsUrls =
    (process.env.CORS_ALLOWED_URLS || '')
        .split(',')
        .map(url => url.trim())
        .filter(Boolean);

const corsOptions = {
    origin: [
        ...allowedCorsUrls,
        'capacitor://localhost',
        'ionic://localhost',
        'http://localhost',
        /^http:\/\/localhost:\d+$/,
    ],
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// ------------------------------------
// Body Parser
// ------------------------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------------------
// Routes
// ------------------------------------

app.use('/api/v1', routes);

// ------------------------------------
// Database
// ------------------------------------

const config = require('./config/config.js')[env];

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host,
        dialect: config.dialect,

        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },

        logging: false,
    }
);

sequelize
    .authenticate()
    .then(() => {
        logger.info(
            'Connection to the database has been established successfully.'
        );
    })
    .catch((err) => {
        logger.error(
            'Unable to connect to the database:',
            err
        );
    });

// ------------------------------------
// Error Handler
// ------------------------------------

app.use((err, req, res, next) => {

    logger.error('Error occurred:', err);
    logger.error(err.stack);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

// ------------------------------------
// Export
// ------------------------------------

module.exports = app;

// ------------------------------------
// Start Server
// ------------------------------------

if (process.env.NODE_ENV !== 'test') {

    const PORT = process.env.PORT || 3033;

    app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
    });
}