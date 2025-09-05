const express = require('express');
const authController = require('../controllers/AuthController');
const authValidation = require('../validators/AuthValidator');
const validationHandler = require('../utils/ValidationHandler');
const authGuard = require('../middlewares/AuthGuard');
const tfaController = require('../controllers/TfaController');
const tfaValidator = require('../validators/TfaValidator');

const router = express.Router();

router.post('/register', authValidation.register, validationHandler, authController.register);
router.post('/login', authValidation.login, validationHandler, authController.login);
router.post('/refresh', authValidation.refresh, validationHandler, authController.refresh);
router.post('/logout', authGuard, authController.logout);
router.post('/logout-all', authGuard, authController.logoutAll);
router.post('/tfa/verify', tfaValidator.verify, validationHandler, tfaController.verify);

module.exports = router;