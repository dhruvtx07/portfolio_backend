const { createLogger, format, transports } = require('winston');
const path = require('path');

const logFilePath = path.join(__dirname, 'storage/logs/app.log');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `${info.timestamp} - ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.File({ filename: logFilePath }),
    new transports.Console()
  ]
});

module.exports = logger;
