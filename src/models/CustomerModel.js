const mongoose = require('mongoose');

function slugify(name) {
  const trMap = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u'
  };

  return String(name || '')
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, ch => trMap[ch] || ch)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[a-z0-9-]+$/
  },
  prompt: {
    type: String,
    trim: true,
    maxlength: 2000
  }
}, {
  timestamps: true
});

customerSchema.pre('validate', async function (next) {
  try {
    if (!(this.isNew || this.isModified('name'))) return next();

    const base = slugify(this.name) || 'customer';
    let candidate = base;

    let counter = 2;
    const exists = async (s) => {
      const found = await this.constructor.exists({ slug: s, _id: { $ne: this._id } });
      return !!found;
    };

    while (await exists(candidate)) {
      candidate = `${base}-${counter++}`;
    }

    this.slug = candidate;
    next();
  } catch (err) {
    next(err);
  }
});

customerSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  }
});

customerSchema.index({ slug: 1 }, { unique: true });
customerSchema.index({ name: 1 });

module.exports = mongoose.model('Customer', customerSchema);