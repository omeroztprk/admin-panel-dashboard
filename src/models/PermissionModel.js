const mongoose = require('mongoose');
const { RESOURCES, ACTIONS } = require('../utils/Constants');

const permissionSchema = new mongoose.Schema({
  resource: {
    type: String,
    required: true,
    enum: Object.values(RESOURCES)
  },
  action: {
    type: String,
    required: true,
    enum: Object.values(ACTIONS)
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  isSystem: {
    type: Boolean,
    default: false,
    immutable: true
  }
}, {
  timestamps: true
});

permissionSchema.index({ name: 1 }, { unique: true });
permissionSchema.index({ resource: 1, action: 1 }, { unique: true });

permissionSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Permission', permissionSchema);