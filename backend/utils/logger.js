// utils/logger.js

const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf((info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)
);

// Create logger instance
const logger = createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    // Console transport
    new transports.Console(),

    // File transport with daily rotation
    new transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

// If not in production, also log to the console with colorized output
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      logFormat
    ),
  }));
}

module.exports = logger;
