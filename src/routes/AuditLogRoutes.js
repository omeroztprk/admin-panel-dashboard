const express = require('express');
const auditLogController = require('../controllers/AuditLogController');
const auditLogValidator = require('../validators/AuditLogValidator');
const validationHandler = require('../utils/ValidationHandler');
const authGuard = require('../middlewares/AuthGuard');
const rbac = require('../middlewares/Rbac');
const { PERMISSIONS } = require('../utils/Constants');

const router = express.Router();

router.get('/', authGuard, rbac(PERMISSIONS.AUDIT_READ), auditLogValidator.list, validationHandler, auditLogController.list);
router.get('/:id', authGuard, rbac(PERMISSIONS.AUDIT_READ), auditLogValidator.getById, validationHandler, auditLogController.getById);

module.exports = router;