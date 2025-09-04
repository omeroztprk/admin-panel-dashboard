const express = require('express');
const permissionController = require('../controllers/PermissionController');
const permissionValidator = require('../validators/PermissionValidator');
const validationHandler = require('../utils/ValidationHandler');
const authGuard = require('../middlewares/AuthGuard');
const rbac = require('../middlewares/Rbac');
const { PERMISSIONS } = require('../utils/Constants');

const router = express.Router();

router.get('/', authGuard, rbac(PERMISSIONS.PERMISSION_READ), permissionValidator.list, validationHandler, permissionController.list);
router.get('/:id', authGuard, rbac(PERMISSIONS.PERMISSION_READ), permissionValidator.getById, validationHandler, permissionController.getById);
router.post('/', authGuard, rbac(PERMISSIONS.PERMISSION_CREATE), permissionValidator.create, validationHandler, permissionController.create);
router.patch('/:id', authGuard, rbac(PERMISSIONS.PERMISSION_UPDATE), permissionValidator.update, validationHandler, permissionController.update);
router.delete('/:id', authGuard, rbac(PERMISSIONS.PERMISSION_DELETE), permissionValidator.remove, validationHandler, permissionController.remove);

module.exports = router;