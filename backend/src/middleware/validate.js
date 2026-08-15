const AppError = require("../utils/AppError");

// Usage: router.post("/login", validate(loginSchema), controller)
// Keeps controllers free of manual "if (!req.body.x)" checks.
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return next(new AppError(message, 400, "VALIDATION_ERROR"));
    }
    req.body = result.data; // parsed + defaults applied
    next();
  };
}

module.exports = validate;
