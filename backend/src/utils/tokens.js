const jwt = require("jsonwebtoken");
const crypto = require("crypto");

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_TTL || "15m" }
  );
}

// Refresh tokens are random opaque strings, not JWTs — we store a HASH of
// them in the database so a leaked DB dump doesn't hand out valid sessions.
function generateRefreshToken() {
  const raw = crypto.randomBytes(48).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, tokenHash };
}

function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

module.exports = { signAccessToken, generateRefreshToken, hashToken };
