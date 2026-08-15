// A predictable, operational error we can throw anywhere in the app.
// Anything that isn't an AppError is treated as a bug and logged with full stack trace.
class AppError extends Error {
  constructor(message, statusCode, code = "ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code; // machine-readable code the frontend can branch on
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
