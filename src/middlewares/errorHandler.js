export function errorHandler(err, req, res, next) {
  // Log the full error (stack preferred)
  if (process.env.NODE_ENV === 'development') {
    console.error('🔥 Error (dev):', err && (err.stack || err));
  } else {
    console.error('🔥 Error:', err && err.message ? err.message : err);
  }

  // Determine status and message
  const status = err?.statusCode || err?.status || 500;
  const message = err?.message || 'Internal Server Error';

  // Optional application-specific code and extra data
  const appCode = err && typeof err.code !== 'undefined' ? err.code : undefined;
  const data = err && typeof err.data !== 'undefined' ? err.data : undefined;

  // Map some known error names to friendly messages/status
  if (err && err.name === 'ValidationError') {
    // Mongoose validation
    const details = Object.values(err.errors || {}).map(e => e.message).join(', ');
    return safeJson(res, 400, { success: false, message: details || message, error: appCode || 'VALIDATION_ERROR' });
  }

  if (err && err.name === 'CastError') {
    return safeJson(res, 400, { success: false, message: `Invalid ${err.path}: ${err.value}`, error: appCode || 'CAST_ERROR' });
  }

  if (err && err.name === 'TokenExpiredError') {
    return safeJson(res, 401, { success: false, message: 'Access token expired. Use refresh token to obtain a new access token.', error: appCode || 'TOKEN_EXPIRED' });
  }

  if (err && err.name === 'JsonWebTokenError') {
    return safeJson(res, 401, { success: false, message: 'Invalid token. Please login again.', error: appCode || 'TOKEN_INVALID' });
  }

  // Default response
  const payload = { success: false, message };
  if (appCode !== undefined) payload.code = appCode;
  if (data !== undefined) payload.data = data;
  if (process.env.NODE_ENV === 'development') payload.stack = err && err.stack;

  return safeJson(res, status, payload);
}

// Helper to send JSON only if headers not sent and response is writable
function safeJson(res, statusCode, body) {
  try {
    if (res.headersSent) {
      // If headers already sent, abort further handling
      console.warn('Response headers already sent, skipping error JSON');
      return res;
    }
    return res.status(statusCode).json(body);
  } catch (sendErr) {
    // Last resort: try to end response
    try {
      res.statusCode = statusCode || 500;
      res.end(JSON.stringify({ success: false, message: 'Fatal error while sending error response' }));
    } catch (e) {
      // Nothing we can do
    }
    return res;
  }
}
