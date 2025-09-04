const paginate = async (model, query = {}, options = {}) => {
  const {
    page = 1,
    limit = 20,
    sort = { createdAt: -1 },
    select = '',
    populate = ''
  } = options;

  const validPage = Math.max(1, Number(page) || 1);
  const validLimit = Math.min(100, Math.max(1, Number(limit) || 20)); // max 100
  const skip = (validPage - 1) * validLimit;

  let queryBuilder = model.find(query);

  if (select) queryBuilder = queryBuilder.select(select);
  if (populate) queryBuilder = queryBuilder.populate(populate);

  const [data, total] = await Promise.all([
    queryBuilder.sort(sort).skip(skip).limit(validLimit).exec(),
    model.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / validLimit);
  const hasNextPage = validPage < totalPages;
  const hasPrevPage = validPage > 1;

  return {
    data,
    meta: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage
    }
  };
};

module.exports = paginate;