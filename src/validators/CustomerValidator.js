const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

const CustomerValidator = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),

    body('prompt')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Prompt must not exceed 2000 characters'),

    body('slug').not().exists().withMessage('Slug is auto-generated')
  ],

  update: [
    param('id')
      .custom((id) => mongoose.Types.ObjectId.isValid(id))
      .withMessage('Invalid customer ID format'),

    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),

    body('prompt')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Prompt must not exceed 2000 characters'),

    body('slug')
      .not()
      .exists()
      .withMessage('Slug cannot be updated directly')
  ],

  getById: [
    param('id')
      .custom((id) => mongoose.Types.ObjectId.isValid(id))
      .withMessage('Invalid customer ID format')
  ],

  getBySlug: [
    param('slug')
      .trim()
      .notEmpty()
      .withMessage('Slug is required')
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Invalid slug format')
  ],

  remove: [
    param('id')
      .custom((id) => mongoose.Types.ObjectId.isValid(id))
      .withMessage('Invalid customer ID format')
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

module.exports = CustomerValidator;