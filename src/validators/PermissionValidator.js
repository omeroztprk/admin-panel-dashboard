const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');
const { RESOURCES, ACTIONS } = require('../utils/Constants');

const PermissionValidator = {
  create: [
    body('resource')
      .isIn(Object.values(RESOURCES))
      .withMessage('Invalid resource'),

    body('action')
      .isIn(Object.values(ACTIONS))
      .withMessage('Invalid action'),

    body('description')
      .optional()
      .trim()
  ],

  update: [
    param('id')
      .custom((id) => mongoose.Types.ObjectId.isValid(id))
      .withMessage('Invalid permission ID format'),

    body('resource')
      .optional()
      .isIn(Object.values(RESOURCES))
      .withMessage('Invalid resource'),

    body('action')
      .optional()
      .isIn(Object.values(ACTIONS))
      .withMessage('Invalid action'),

    body('description')
      .optional()
      .trim()
  ],

  getById: [
    param('id')
      .custom((id) => mongoose.Types.ObjectId.isValid(id))
      .withMessage('Invalid permission ID format')
  ],

  remove: [
    param('id')
      .custom((id) => mongoose.Types.ObjectId.isValid(id))
      .withMessage('Invalid permission ID format')
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

module.exports = PermissionValidator;