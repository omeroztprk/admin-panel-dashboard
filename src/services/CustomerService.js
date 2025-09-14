const Customer = require('../models/CustomerModel');
const paginate = require('../utils/Paginate');
const auditLogService = require('./AuditLogService');
const { ACTIONS, RESOURCES } = require('../utils/Constants');

const customerService = {
  list: async (options = {}) => {
    return paginate(Customer, {}, {
      ...options,
      select: '-__v',
      sort: { createdAt: -1 }
    });
  },

  getById: async (id) => {
    const customer = await Customer.findById(id).select('-__v');
    if (!customer) {
      const err = new Error('Customer not found');
      err.statusCode = 404;
      throw err;
    }
    return customer;
  },

  getBySlug: async (slug) => {
    const customer = await Customer.findOne({ slug }).select('-__v');
    if (!customer) {
      const err = new Error('Customer not found');
      err.statusCode = 404;
      throw err;
    }
    return customer;
  },

  create: async (customerData, currentUserId) => {
    try {
      const customer = await Customer.create(customerData);

      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.CREATE,
        resource: RESOURCES.CUSTOMER,
        resourceId: customer._id.toString(),
        status: 'success'
      });

      return customer;
    } catch (error) {
      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.CREATE,
        resource: RESOURCES.CUSTOMER,
        status: 'failure'
      });
      throw error;
    }
  },

  update: async (id, updateData, currentUserId) => {
    try {
      const customer = await Customer.findById(id);
      if (!customer) {
        const err = new Error('Customer not found');
        err.statusCode = 404;
        throw err;
      }

      Object.assign(customer, updateData);
      await customer.save();

      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.UPDATE,
        resource: RESOURCES.CUSTOMER,
        resourceId: id,
        status: 'success'
      });

      return customer;
    } catch (error) {
      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.UPDATE,
        resource: RESOURCES.CUSTOMER,
        resourceId: id,
        status: 'failure'
      });
      throw error;
    }
  },

  remove: async (id, currentUserId) => {
    try {
      const customer = await Customer.findByIdAndDelete(id);

      if (!customer) {
        const err = new Error('Customer not found');
        err.statusCode = 404;
        throw err;
      }

      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.DELETE,
        resource: RESOURCES.CUSTOMER,
        resourceId: id,
        status: 'success'
      });

      return customer;
    } catch (error) {
      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.DELETE,
        resource: RESOURCES.CUSTOMER,
        resourceId: id,
        status: 'failure'
      });
      throw error;
    }
  }
};

module.exports = customerService;