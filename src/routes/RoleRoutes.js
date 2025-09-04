const express = require('express');
const roleController = require('../controllers/RoleController');
const roleValidator = require('../validators/RoleValidator');
const validationHandler = require('../utils/ValidationHandler');
const authGuard = require('../middlewares/AuthGuard');
const rbac = require('../middlewares/Rbac');
const { PERMISSIONS } = require('../utils/Constants');

const router = express.Router();

router.get('/', authGuard, rbac(PERMISSIONS.ROLE_READ), roleValidator.list, validationHandler, roleController.list);
router.get('/:id', authGuard, rbac(PERMISSIONS.ROLE_READ), roleValidator.getById, validationHandler, roleController.getById);
router.post('/', authGuard, rbac(PERMISSIONS.ROLE_CREATE), roleValidator.create, validationHandler, roleController.create);
router.patch('/:id', authGuard, rbac(PERMISSIONS.ROLE_UPDATE), roleValidator.update, validationHandler, roleController.update);
router.delete('/:id', authGuard, rbac(PERMISSIONS.ROLE_DELETE), roleValidator.remove, validationHandler, roleController.remove);

module.exports = router;