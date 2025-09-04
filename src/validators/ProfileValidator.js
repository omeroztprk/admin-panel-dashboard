const { body } = require('express-validator');

const profileValidator = {
  update: [
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

    body('roles')
      .not()
      .exists()
      .withMessage('Roles cannot be updated via profile'),

    body('isActive')
      .not()
      .exists()
      .withMessage('isActive cannot be updated via profile'),

    body('avatar')
      .not()
      .exists()
      .withMessage('Avatar cannot be updated'),

    body('currentPassword')
      .optional()
      .isString()
      .withMessage('currentPassword must be a string'),

    body('newPassword')
      .optional()
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .withMessage(
        'New password must contain at least one lowercase letter, one uppercase letter, one number and one special character'
      ),

    body(['currentPassword', 'newPassword']).custom((_, { req }) => {
      if (
        (req.body.currentPassword && !req.body.newPassword) ||
        (!req.body.currentPassword && req.body.newPassword)
      ) {
        throw new Error('Both currentPassword and newPassword are required together');
      }
      return true;
    })
  ]
};

module.exports = profileValidator;
