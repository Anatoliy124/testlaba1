const winston = require('winston');
require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'local';

const localFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `[${timestamp}] ${level}: ${message} ${metaStr}`;
  })
);

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const logFormat = NODE_ENV === 'local' ? localFormat : prodFormat;

const logger = winston.createLogger({
  level: NODE_ENV === 'prod' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    new winston.transports.Console()
  ]
});

module.exports = logger;