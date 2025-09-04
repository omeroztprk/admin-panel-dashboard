const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  if (err.name === 'ValidationError') status = 400;
  else if (err.code === 11000) status = 409;
  else if (['TokenExpiredError', 'JsonWebTokenError'].includes(err.name)) status = 401;
  else if (err.name === 'CastError') status = 400;

  let body = { error: { message: err.message || 'Internal server error' } };

  if (err.name === 'ValidationError') {
    body = {
      error: {
        message: 'Validation failed',
        details: Object.values(err.errors).map(e => e.message)
      }
    };
  } else if (err.code === 11000) {
    const fields = Object.keys(err.keyValue);
    body = { error: { message: `Duplicate value for field(s): ${fields.join(', ')}` } };
  } else if (err.name === 'TokenExpiredError') {
    body = { error: { message: 'Token expired' } };
  } else if (err.name === 'JsonWebTokenError') {
    body = { error: { message: 'Invalid token' } };
  } else if (err.name === 'CastError') {
    body = { error: { message: 'Invalid ID format' } };
  }

  if (status >= 500) {
    let detail = err.message || 'Error';
    if (detail.length > 160) detail = detail.slice(0, 157) + '...';
    res.locals._errLog = detail;
  }

  res.status(status).json(body);
};

module.exports = errorHandler;