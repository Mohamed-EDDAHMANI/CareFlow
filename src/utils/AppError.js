export default class AppError extends Error {
    /**
     * AppError used for operational errors
     * @param {string} message - human readable message
     * @param {number} statusCode - HTTP status code
     * @param {string} [code] - short machine error code (e.g. NO_TOKEN)
     */
    constructor(message, statusCode = 500, code = undefined) {
      super(message);
      this.statusCode = statusCode;
      this.code = code; // optional short error code
      this.isOperational = true;
      Error.captureStackTrace(this, this.constructor);
    }
  }

