const express = require('express');
const authGuard = require('../middlewares/AuthGuard');
const profileController = require('../controllers/ProfileController');
const profileValidator = require('../validators/ProfileValidator');
const validationHandler = require('../utils/ValidationHandler');

const router = express.Router();

router.get('/', authGuard, profileController.get);
router.patch('/', authGuard, profileValidator.update, validationHandler, profileController.update);

module.exports = router;