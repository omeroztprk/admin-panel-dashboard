const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

const CategoryValidator = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),

    body('parent')
      .optional({ nullable: true })
      .custom(v => v === null || mongoose.Types.ObjectId.isValid(v))
      .withMessage('Invalid parent ID format'),

    body('description')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Description max length is 255 characters')
  ],

  update: [
    param('id')
      .custom(id => mongoose.Types.ObjectId.isValid(id))
      .withMessage('Invalid category ID format'),

    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),

    body('parent')
      .optional({ nullable: true })
      .custom((val, { req }) => {
        if (val === null) return true;
        if (!mongoose.Types.ObjectId.isValid(val)) throw new Error('Invalid parent ID format');
        if (String(val) === req.params.id) throw new Error('Category cannot be its own parent');
        return true;
      }),

    body('description')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Description max length is 255 characters')
  ],

  getById: [
    param('id')
      .custom(id => mongoose.Types.ObjectId.isValid(id))
      .withMessage('Invalid category ID format')
  ],

  remove: [
    param('id')
      .custom(id => mongoose.Types.ObjectId.isValid(id))
      .withMessage('Invalid category ID format')
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

module.exports = CategoryValidator;