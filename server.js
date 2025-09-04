const config = require('./src/config');
const connectDB = require('./src/config/database');
const app = require('./src/app');
const logger = require('./src/utils/Logger');
const mongoose = require('mongoose');

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  try {
    logger.info(`${signal} received. Shutting down gracefully...`);

    if (server) {
      server.close(() => {
        logger.info('HTTP server closed.');
      });
    }

    await mongoose.connection.close();
    logger.info('MongoDB connection closed.');

    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
