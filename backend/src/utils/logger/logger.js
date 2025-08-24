const fs = require('fs');
const winston = require('winston');
const path = require('path');
const { combine, timestamp, printf, colorize, metadata } = require('winston');

// Always put logs in "<project-root>/shared/logs"
//const logsDir = path.join(process.cwd(), 'shared', 'logs');
const logsDir = 'C:\\Dev\\Git\\TestVSCode\\shared\\logs';

// Create folder if not exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log("Created logs directory:", logsDir);
}

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, source, method }) => {
      const sourceInfo = source ? `[${source}${method ? `::${method}` : ''}]` : '';
      return `${timestamp || new Date().toISOString()} [${level.toUpperCase()}] ${sourceInfo}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log')
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'debug.log'),
      level: 'debug'
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, source, method }) => {
          const sourceInfo = source ? `[${source}${method ? `::${method}` : ''}]` : '';
          // Apply colors manually to avoid conflicts
          const colors = {
            error: '\x1b[31m',   // red
            warn: '\x1b[33m',    // yellow
            info: '\x1b[36m',    // cyan
            debug: '\x1b[37m',   // white
            reset: '\x1b[0m'     // reset
          };
          const color = colors[level] || colors.info;
          return `${timestamp} ${color}[${level.toUpperCase()}]${colors.reset} ${sourceInfo}: ${message}`;
        })
      )
    })
  ]
});

module.exports = logger;