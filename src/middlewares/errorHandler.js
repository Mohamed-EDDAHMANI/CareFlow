export function errorHandler(err, req, res, next) {
  console.error('🔥 Error:', err);

  let status = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // 🔸 Erreurs MongoDB
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map(e => e.message)
      .join(', ');
  }

  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // 🔸 JWT errors
  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid or expired token';
  }

  if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token has expired';
  }

  res.status(status).json({
    success: false,
    error: message,
  });
}
