const config = require('../config');

const supportsColor = process.stdout.isTTY;
const C = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

const colorize = (on, color, text) => (on ? color + text + C.reset : text);

const levelColor = (level) => {
  switch (level) {
    case 'INFO': return C.green;
    case 'WARN': return C.yellow;
    case 'ERROR': return C.red;
    case 'DEBUG': return C.magenta;
    default: return C.gray;
  }
};

const formatLine = (level, method, url, status, durationMs, errorInfo) => {
  const color = levelColor(level);
  const base = `${colorize(supportsColor, color, `[${level}]`)} ${method} ${url} ${colorize(supportsColor, color, String(status))} ${durationMs.toFixed(3)} ms`;
  return errorInfo ? `${base} :: ${errorInfo}` : `${base}`;
};

const logger = {
  request(level, method, url, status, durationMs, errorInfo) {
    console.log(formatLine(level, method, url, status, durationMs, errorInfo));
  },
  info(msg, ...args) {
    console.log(colorize(supportsColor, levelColor('INFO'), '[INFO]'), msg, ...args);
  },
  warn(msg, ...args) {
    console.warn(colorize(supportsColor, levelColor('WARN'), '[WARN]'), msg, ...args);
  },
  error(msg, ...args) {
    console.error(colorize(supportsColor, levelColor('ERROR'), '[ERROR]'), msg, ...args);
  },
  debug(msg, ...args) {
    if (config.NODE_ENV === 'production') return;
    console.debug(colorize(supportsColor, levelColor('DEBUG'), '[DEBUG]'), msg, ...args);
  }
};

module.exports = logger;