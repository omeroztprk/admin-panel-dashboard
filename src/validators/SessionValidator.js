const { param, query } = require('express-validator');
const mongoose = require('mongoose');

const SessionValidator = {
  remove: [
    param('id')
      .custom((id) => mongoose.Types.ObjectId.isValid(id))
      .withMessage('Invalid session ID format')
  ],

  list: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ]
};

module.exports = SessionValidator;