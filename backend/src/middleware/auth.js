const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

// Verifies the access token on every protected request.
// Client sends it as: Authorization: Bearer <token>
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new AppError("Authentication required.", 401, "NO_TOKEN"));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = payload; // { sub: userId, role, email }
    next();
  } catch (err) {
    return next(new AppError("Session expired or invalid. Please sign in again.", 401, "INVALID_TOKEN"));
  }
}

// Usage: requireRole("REGISTRAR") or requireRole("REGISTRAR", "LECTURER")
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action.", 403, "FORBIDDEN"));
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
