const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

const RoleValidator = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Role name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Role name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z0-9_-\s]+$/)
      .withMessage('Role name can only contain letters, numbers, spaces, hyphens and underscores'),

    body('displayName')
      .optional()
      .trim(),

    body('permissions')
      .optional()
      .isArray()
      .withMessage('Permissions must be an array')
      .custom((permissions) => {
        return permissions.every(permission => mongoose.Types.ObjectId.isValid(permission));
      })
      .withMessage('Invalid permission ID format')
  ],

  update: [
    param('id')
      .custom((id) => mongoose.Types.ObjectId.isValid(id))
      .withMessage('Invalid role ID format'),

    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Role name cannot be empty')
      .isLength({ min: 2, max: 50 })
      .withMessage('Role name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z0-9_-\s]+$/)
      .withMessage('Role name can only contain letters, numbers, spaces, hyphens and underscores'),

    body('displayName')
      .optional()
      .trim(),

    body('permissions')
      .optional()
      .isArray()
      .withMessage('Permissions must be an array')
      .custom((permissions) => {
        return permissions.every(permission => mongoose.Types.ObjectId.isValid(permission));
      })
      .withMessage('Invalid permission ID format')
  ],

  getById: [
    param('id')
      .custom((id) => mongoose.Types.ObjectId.isValid(id))
      .withMessage('Invalid role ID format')
  ],

  remove: [
    param('id')
      .custom((id) => mongoose.Types.ObjectId.isValid(id))
      .withMessage('Invalid role ID format')
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

module.exports = RoleValidator;