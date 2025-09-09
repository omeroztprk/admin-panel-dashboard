const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

const UserValidator = {
  create: [
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 2, max: 25 })
      .withMessage('First name must be between 2 and 25 characters'),

    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ min: 2, max: 25 })
      .withMessage('Last name must be between 2 and 25 characters'),

    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),

    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]).+$/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number and one special character'),

    body('roles')
      .optional()
      .isArray()
      .withMessage('Roles must be an array')
      .custom((roles) => {
        return roles.every(role => mongoose.Types.ObjectId.isValid(role));
      })
      .withMessage('Invalid role ID format'),

    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be boolean')
  ],

  update: [
    param('id')
      .custom((id) => mongoose.Types.ObjectId.isValid(id))
      .withMessage('Invalid user ID format'),

    body('firstName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('First name cannot be empty')
      .isLength({ min: 2, max: 25 })
      .withMessage('First name must be between 2 and 25 characters'),

    body('lastName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Last name cannot be empty')
      .isLength({ min: 2, max: 25 })
      .withMessage('Last name must be between 2 and 25 characters'),

    body('email')
      .not()
      .exists()
      .withMessage('Email cannot be updated'),

    body('avatar')
      .not()
      .exists()
      .withMessage('Avatar cannot be updated'),

    body('password')
      .optional()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]).+$/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number and one special character'),

    body('roles')
      .optional()
      .isArray()
      .withMessage('Roles must be an array')
      .custom((roles) => {
        return roles.every(role => mongoose.Types.ObjectId.isValid(role));
      })
      .withMessage('Invalid role ID format'),

    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be boolean')
      .toBoolean()
  ],

  getById: [
    param('id')
      .custom((id) => mongoose.Types.ObjectId.isValid(id))
      .withMessage('Invalid user ID format')
  ],

  remove: [
    param('id')
      .custom((id) => mongoose.Types.ObjectId.isValid(id))
      .withMessage('Invalid user ID format')
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

module.exports = UserValidator;