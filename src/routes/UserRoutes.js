const express = require('express');
const userController = require('../controllers/UserController');
const userValidator = require('../validators/UserValidator');
const validationHandler = require('../utils/ValidationHandler');
const authGuard = require('../middlewares/AuthGuard');
const rbac = require('../middlewares/Rbac');
const { PERMISSIONS } = require('../utils/Constants');

const router = express.Router();

router.get('/', authGuard, rbac(PERMISSIONS.USER_READ), userValidator.list, validationHandler, userController.list);
router.get('/:id', authGuard, rbac(PERMISSIONS.USER_READ), userValidator.getById, validationHandler, userController.getById);
router.post('/', authGuard, rbac(PERMISSIONS.USER_CREATE), userValidator.create, validationHandler, userController.create);
router.patch('/:id', authGuard, rbac(PERMISSIONS.USER_UPDATE), userValidator.update, validationHandler, userController.update);
router.delete('/:id', authGuard, rbac(PERMISSIONS.USER_DELETE), userValidator.remove, validationHandler, userController.remove);

module.exports = router;