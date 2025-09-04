const mongoose = require('mongoose');
const config = require('.');
const logger = require('../utils/Logger');

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;