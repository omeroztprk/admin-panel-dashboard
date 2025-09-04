const express = require('express');
const categoryController = require('../controllers/CategoryController');
const categoryValidator = require('../validators/CategoryValidator');
const validationHandler = require('../utils/ValidationHandler');
const authGuard = require('../middlewares/AuthGuard');
const rbac = require('../middlewares/Rbac');
const { PERMISSIONS } = require('../utils/Constants');

const router = express.Router();

router.get('/tree', authGuard, rbac(PERMISSIONS.CATEGORY_READ), categoryController.tree);
router.get('/', authGuard, rbac(PERMISSIONS.CATEGORY_READ), categoryValidator.list, validationHandler, categoryController.list);
router.get('/:id', authGuard, rbac(PERMISSIONS.CATEGORY_READ), categoryValidator.getById, validationHandler, categoryController.getById);
router.post('/', authGuard, rbac(PERMISSIONS.CATEGORY_CREATE), categoryValidator.create, validationHandler, categoryController.create);
router.patch('/:id', authGuard, rbac(PERMISSIONS.CATEGORY_UPDATE), categoryValidator.update, validationHandler, categoryController.update);
router.delete('/:id', authGuard, rbac(PERMISSIONS.CATEGORY_DELETE), categoryValidator.remove, validationHandler, categoryController.remove);

module.exports = router;