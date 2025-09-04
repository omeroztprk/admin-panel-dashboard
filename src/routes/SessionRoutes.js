const express = require('express');
const sessionController = require('../controllers/SessionController');
const sessionValidator = require('../validators/SessionValidator');
const validationHandler = require('../utils/ValidationHandler');
const authGuard = require('../middlewares/AuthGuard');

const router = express.Router();

router.get('/', authGuard, sessionValidator.list, validationHandler, sessionController.list);
router.delete('/:id', authGuard, sessionValidator.remove, validationHandler, sessionController.remove);
router.delete('/', authGuard, sessionController.removeAll);

module.exports = router;