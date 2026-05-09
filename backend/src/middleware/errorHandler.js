/**
 * Central error handler — must be the LAST middleware registered.
 * Catches errors thrown via next(err) or throw inside async routes.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error] ${req.method} ${req.originalUrl} — ${status}: ${message}`);
    if (err.stack) console.error(err.stack);
  }

  res.status(status).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};

/**
 * Helper: create a structured HTTP error and pass it to next()
 * Usage: next(createError(404, 'User not found'))
 */
const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

module.exports = { errorHandler, createError };
