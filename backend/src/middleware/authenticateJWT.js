const jwt = require('jsonwebtoken');
const { createError } = require('./errorHandler');

/**
 * authenticateJWT — validates the Bearer token in the Authorization header.
 * On success: attaches req.user = { id, email, name } to the request.
 * On failure: passes a 401 error to the central error handler.
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError(401, 'Authorization token required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(createError(401, 'Token expired'));
    }
    return next(createError(401, 'Invalid token'));
  }
};

module.exports = authenticateJWT;
