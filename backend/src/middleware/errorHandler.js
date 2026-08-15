const logger = require("../utils/logger");

// Must be registered LAST, after all routes. Express recognizes it as an
// error handler because it takes 4 arguments.
function errorHandler(err, req, res, next) {
  const isOperational = err.isOperational === true;
  const statusCode = err.statusCode || 500;

  if (!isOperational) {
    // Unexpected bug — log full detail server-side, never leak internals to the client.
    logger.error("Unhandled error", { message: err.message, stack: err.stack, path: req.path });
  } else {
    logger.warn(err.message, { code: err.code, path: req.path });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: isOperational ? err.message : "Something went wrong. Please try again.",
    },
  });
}

// Wraps async route handlers so thrown errors reach errorHandler
// instead of crashing the process (no need for try/catch in every controller).
function catchAsync(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { errorHandler, catchAsync };
