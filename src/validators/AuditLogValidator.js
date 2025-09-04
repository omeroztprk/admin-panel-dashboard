const { param, query } = require('express-validator');
const mongoose = require('mongoose');

const auditLogValidator = {
  getById: [
    param('id')
      .custom((id) => mongoose.Types.ObjectId.isValid(id))
      .withMessage('Invalid audit log ID format')
  ],

  list: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),

    query('user')
      .optional()
      .custom((id) => mongoose.Types.ObjectId.isValid(id))
      .withMessage('Invalid user ID format'),

    query('status')
      .optional()
      .isIn(['success', 'failure'])
      .withMessage('Status must be success or failure'),

    query('from')
      .optional()
      .isISO8601()
      .withMessage('From date must be a valid ISO date'),

    query('to')
      .optional()
      .isISO8601()
      .withMessage('To date must be a valid ISO date')
      .custom((to, { req }) => {
        if (req.query.from && new Date(to) < new Date(req.query.from)) {
          throw new Error('To date must be greater than or equal to from date');
        }
        return true;
      })
  ]
};

module.exports = auditLogValidator;