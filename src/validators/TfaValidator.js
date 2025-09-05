const { body } = require('express-validator');
const mongoose = require('mongoose');

const tfaValidator = {
  verify: [
    body('tfaId')
      .custom(id => mongoose.Types.ObjectId.isValid(id))
      .withMessage('Invalid tfaId format'),
    body('code')
      .trim()
      .matches(/^\d{6}$/)
      .withMessage('Code must be 6 digits')
  ]
};

module.exports = tfaValidator;