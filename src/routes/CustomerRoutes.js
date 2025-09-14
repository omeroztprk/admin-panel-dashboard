const express = require('express');
const customerController = require('../controllers/CustomerController');
const customerValidator = require('../validators/CustomerValidator');
const validationHandler = require('../utils/ValidationHandler');
const authGuard = require('../middlewares/AuthGuard');
const rbac = require('../middlewares/Rbac');
const { PERMISSIONS } = require('../utils/Constants');

const router = express.Router();

router.get('/slug/:slug', customerValidator.getBySlug, validationHandler, customerController.getBySlug);
router.get('/', authGuard, rbac(PERMISSIONS.CUSTOMER_READ), customerValidator.list, validationHandler, customerController.list);
router.get('/:id', authGuard, rbac(PERMISSIONS.CUSTOMER_READ), customerValidator.getById, validationHandler, customerController.getById);
router.post('/', authGuard, rbac(PERMISSIONS.CUSTOMER_CREATE), customerValidator.create, validationHandler, customerController.create);
router.patch('/:id', authGuard, rbac(PERMISSIONS.CUSTOMER_UPDATE), customerValidator.update, validationHandler, customerController.update);
router.delete('/:id', authGuard, rbac(PERMISSIONS.CUSTOMER_DELETE), customerValidator.remove, validationHandler, customerController.remove);

module.exports = router;