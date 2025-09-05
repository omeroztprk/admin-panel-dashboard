const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('./utils/Logger');

const errorHandler = require('./middlewares/ErrorHandler');
const notFound = require('./middlewares/NotFound');

const routes = require('./routes');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const status = res.statusCode;
    const level = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';
    logger.request(level, req.method, req.originalUrl, status, durationMs, res.locals._errLog);
  });
  next();
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
