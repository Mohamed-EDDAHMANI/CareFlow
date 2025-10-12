export function errorHandler(err, req, res, next) {
  console.error('🔥 Error:', err);

  let status = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  // Prefer explicit code from AppError if provided
  const code = err.code || (() => {
    if (err.name === 'TokenExpiredError') return 'TOKEN_EXPIRED';
    if (err.name === 'JsonWebTokenError') return 'TOKEN_INVALID';
    return undefined;
  })();

  // MongoDB validation
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

  // If error came from jsonwebtoken and no explicit code set above
  if (!code && err.name === 'TokenExpiredError') {
    // override message for consistency
    message = 'Access token expired. Use refresh token to obtain a new access token.';
    status = 401;
  }

  if (!code && err.name === 'JsonWebTokenError') {
    message = 'Invalid token. Please login again.';
    status = 401;
  }

  res.status(status).json({
    success: false,
    error: code || err.code || 'SERVER_ERROR',
    message,
  });
}
